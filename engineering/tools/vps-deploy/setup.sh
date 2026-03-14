#!/bin/bash
# =============================================================================
# Hetzner VPS Setup Script for OphidianAI
# Run as root on a fresh Ubuntu 24.04 LTS instance
# =============================================================================

set -euo pipefail

USERNAME="eric"
SSH_PORT="2222"

echo "=== Phase 1: User and SSH Hardening ==="

# Create user with sudo
if ! id "$USERNAME" &>/dev/null; then
  adduser --disabled-password --gecos "" "$USERNAME"
  usermod -aG sudo "$USERNAME"
  echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/$USERNAME
  echo "Created user: $USERNAME"
fi

# Copy root's authorized_keys to new user
mkdir -p /home/$USERNAME/.ssh
cp /root/.ssh/authorized_keys /home/$USERNAME/.ssh/
chown -R $USERNAME:$USERNAME /home/$USERNAME/.ssh
chmod 700 /home/$USERNAME/.ssh
chmod 600 /home/$USERNAME/.ssh/authorized_keys

# Harden SSH
sed -i "s/^#\?Port .*/Port $SSH_PORT/" /etc/ssh/sshd_config
sed -i "s/^#\?PasswordAuthentication .*/PasswordAuthentication no/" /etc/ssh/sshd_config
sed -i "s/^#\?PermitRootLogin .*/PermitRootLogin no/" /etc/ssh/sshd_config
sed -i "s/^#\?PubkeyAuthentication .*/PubkeyAuthentication yes/" /etc/ssh/sshd_config
echo "AllowUsers $USERNAME" >> /etc/ssh/sshd_config
systemctl restart sshd
echo "SSH hardened: port $SSH_PORT, key-only, root disabled"

echo "=== Phase 2: Firewall ==="

apt-get update -qq
apt-get install -y -qq ufw fail2ban

ufw default deny incoming
ufw default allow outgoing
ufw allow $SSH_PORT/tcp comment "SSH"
ufw allow 443/tcp comment "HTTPS"
ufw --force enable
echo "Firewall configured"

# Configure fail2ban for custom SSH port
cat > /etc/fail2ban/jail.local << 'JAIL'
[sshd]
enabled = true
port = 2222
maxretry = 3
bantime = 3600
findtime = 600
JAIL
systemctl enable fail2ban
systemctl restart fail2ban
echo "fail2ban configured"

echo "=== Phase 3: System Config ==="

timedatectl set-timezone America/New_York
echo "Timezone set to America/New_York"

# Enable unattended upgrades
apt-get install -y -qq unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
echo "Unattended upgrades enabled"

echo "=== Phase 4: Development Tools ==="

apt-get install -y -qq build-essential curl jq git python3 python3-pip python3-venv

# Install nvm and Node.js 20 as the target user
su - $USERNAME -c 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash'
su - $USERNAME -c 'export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm install 20 && nvm use 20 && nvm alias default 20'
echo "Node.js 20 installed"

# Install global npm packages as the target user
su - $USERNAME -c 'export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && npm install -g @anthropic-ai/claude-code'
echo "Claude Code CLI installed"

# Install Playwright with Chromium
su - $USERNAME -c 'export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && npx playwright install --with-deps chromium'
echo "Playwright + Chromium installed"

echo "=== Phase 5: VS Code Tunnel ==="

# Download VS Code CLI
cd /tmp
curl -fsSL "https://code.visualstudio.com/sha/download?build=stable&os=cli-alpine-x64" -o vscode_cli.tar.gz
tar xzf vscode_cli.tar.gz
mv code /usr/local/bin/code
rm vscode_cli.tar.gz
echo "VS Code CLI installed at /usr/local/bin/code"

echo "=== Phase 6: Iris Automation Directories ==="

mkdir -p /opt/iris/scripts
mkdir -p /var/log/iris
chown -R $USERNAME:$USERNAME /opt/iris
chown -R $USERNAME:$USERNAME /var/log/iris
echo "Iris directories created"

echo ""
echo "=========================================="
echo "  Setup complete!"
echo "=========================================="
echo ""
echo "Next steps (run as $USERNAME):"
echo "  1. ssh -p $SSH_PORT $USERNAME@<server-ip>"
echo "  2. Generate SSH key: ssh-keygen -t ed25519"
echo "  3. Add key to GitHub: cat ~/.ssh/id_ed25519.pub"
echo "  4. Clone repo: git clone git@github.com:<org>/ophidian-ai.git ~/OphidianAI"
echo "  5. Authenticate Claude: claude"
echo "  6. Start VS Code tunnel: code tunnel --accept-server-license-terms"
echo "  7. Register tunnel service: code tunnel service install"
echo "  8. Copy systemd timers: sudo cp /opt/iris/systemd/*.timer /etc/systemd/system/"
echo "  9. Enable timers: sudo systemctl enable --now iris-*.timer"
echo ""
