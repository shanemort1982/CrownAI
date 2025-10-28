# 🚀 CrownAI - Linux Server Deployment Guide

Complete step-by-step guide to deploy CrownAI on your Linux server and access it from your LAN.

## 📋 Prerequisites

- Linux server (Ubuntu, Debian, CentOS, etc.)
- SSH access to the server
- Server accessible on your LAN
- Basic command line knowledge

## 🎯 Deployment Methods

Choose one of these methods based on your needs:

### Method 1: Simple Python Web Server (Quickest)
### Method 2: Nginx Web Server (Production-Ready)
### Method 3: Apache Web Server (Alternative)

---

## 📦 Method 1: Simple Python Web Server

**Best for**: Quick testing, temporary deployment, simple LAN access

### Step 1: Connect to Your Server
```bash
# SSH into your Linux server
ssh username@your-server-ip
```

### Step 2: Install Git (if needed)
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y git

# CentOS/RHEL
sudo yum install -y git

# Check installation
git --version
```

### Step 3: Clone the Repository
```bash
# Navigate to your preferred directory
cd ~

# Clone CrownAI
git clone https://github.com/YOUR_USERNAME/CrownAI.git
cd CrownAI

# Verify files
ls -la
```

### Step 4: Start Python Web Server
```bash
# Python 3 (recommended)
python3 -m http.server 8080 --bind 0.0.0.0

# Or specify a different port
python3 -m http.server 3000 --bind 0.0.0.0
```

### Step 5: Access from LAN
```
Open browser on any device in your LAN:
http://YOUR_SERVER_IP:8080/index.html

Example:
http://192.168.1.100:8080/index.html
```

### Step 6: Run in Background (Optional)
```bash
# Install screen (if needed)
sudo apt install screen  # Ubuntu/Debian
sudo yum install screen  # CentOS/RHEL

# Start screen session
screen -S crownai

# Start server
cd ~/CrownAI
python3 -m http.server 8080 --bind 0.0.0.0

# Detach from screen: Press Ctrl+A, then D

# Reattach later
screen -r crownai

# Kill server: Reattach and press Ctrl+C
```

### Step 7: Firewall Configuration
```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 8080/tcp
sudo ufw reload

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload

# Check firewall status
sudo ufw status        # Ubuntu/Debian
sudo firewall-cmd --list-all  # CentOS/RHEL
```

---

## 🌐 Method 2: Nginx Web Server

**Best for**: Production deployment, better performance, multiple sites

### Step 1: Install Nginx
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nginx

# CentOS/RHEL
sudo yum install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### Step 2: Clone Repository
```bash
# Create web directory
sudo mkdir -p /var/www/crownai

# Clone repository
cd /tmp
git clone https://github.com/YOUR_USERNAME/CrownAI.git

# Copy files to web directory
sudo cp -r CrownAI/* /var/www/crownai/

# Set permissions
sudo chown -R www-data:www-data /var/www/crownai  # Ubuntu/Debian
sudo chown -R nginx:nginx /var/www/crownai        # CentOS/RHEL

# Verify files
ls -la /var/www/crownai
```

### Step 3: Configure Nginx
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/crownai
```

**Paste this configuration:**
```nginx
server {
    listen 80;
    listen [::]:80;
    
    server_name YOUR_SERVER_IP;
    
    root /var/www/crownai;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    # Cache static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### Step 4: Enable Site
```bash
# Ubuntu/Debian
sudo ln -s /etc/nginx/sites-available/crownai /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx

# CentOS/RHEL (sites-available doesn't exist by default)
sudo cp /etc/nginx/sites-available/crownai /etc/nginx/conf.d/crownai.conf
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

### Step 5: Configure Firewall
```bash
# Ubuntu/Debian
sudo ufw allow 'Nginx Full'
sudo ufw reload

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
```

### Step 6: Access from LAN
```
Open browser:
http://YOUR_SERVER_IP/index.html

Example:
http://192.168.1.100/index.html
```

---

## 🔧 Method 3: Apache Web Server

**Best for**: Those familiar with Apache, shared hosting

### Step 1: Install Apache
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y apache2

# CentOS/RHEL
sudo yum install -y httpd

# Start and enable Apache
sudo systemctl start apache2   # Ubuntu/Debian
sudo systemctl start httpd     # CentOS/RHEL

sudo systemctl enable apache2  # Ubuntu/Debian
sudo systemctl enable httpd    # CentOS/RHEL
```

### Step 2: Clone Repository
```bash
# Default Apache web directory
cd /var/www/html

# Clone repository
sudo git clone https://github.com/YOUR_USERNAME/CrownAI.git

# Set permissions
sudo chown -R www-data:www-data CrownAI  # Ubuntu/Debian
sudo chown -R apache:apache CrownAI      # CentOS/RHEL
```

### Step 3: Configure Apache (Optional)
```bash
# Create virtual host
sudo nano /etc/apache2/sites-available/crownai.conf  # Ubuntu/Debian
sudo nano /etc/httpd/conf.d/crownai.conf            # CentOS/RHEL
```

**Paste this configuration:**
```apache
<VirtualHost *:80>
    ServerName YOUR_SERVER_IP
    DocumentRoot /var/www/html/CrownAI
    
    <Directory /var/www/html/CrownAI>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/crownai_error.log
    CustomLog ${APACHE_LOG_DIR}/crownai_access.log combined
</VirtualHost>
```

### Step 4: Enable Site
```bash
# Ubuntu/Debian
sudo a2ensite crownai
sudo systemctl reload apache2

# CentOS/RHEL
sudo systemctl restart httpd
```

### Step 5: Configure Firewall
```bash
# Ubuntu/Debian
sudo ufw allow 'Apache Full'
sudo ufw reload

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
```

### Step 6: Access from LAN
```
Open browser:
http://YOUR_SERVER_IP/CrownAI/index.html

Or if using virtual host:
http://YOUR_SERVER_IP/index.html
```

---

## 🔒 Security Considerations

### Basic Security Steps

1. **Keep Software Updated**
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

2. **Limit Access to LAN Only** (Optional)
```bash
# Nginx - Edit your config
sudo nano /etc/nginx/sites-available/crownai

# Add inside server block:
allow 192.168.1.0/24;  # Your LAN subnet
deny all;

# Apache - Edit your config
sudo nano /etc/apache2/sites-available/crownai.conf

# Add inside Directory block:
Require ip 192.168.1.0/24

# Restart web server
sudo systemctl restart nginx    # or apache2/httpd
```

3. **Change Default Port** (Optional)
```nginx
# Nginx - Change 80 to your preferred port
listen 8080;
listen [::]:8080;
```

```apache
# Apache - Edit ports.conf
sudo nano /etc/apache2/ports.conf  # Ubuntu/Debian
sudo nano /etc/httpd/conf/httpd.conf  # CentOS/RHEL

# Change: Listen 80
# To: Listen 8080
```

---

## 🔄 Updating CrownAI

### Method 1: Manual Update
```bash
# Navigate to installation directory
cd ~/CrownAI  # or /var/www/crownai

# Pull latest changes
sudo git pull origin main

# Restart web server if needed
sudo systemctl restart nginx  # or apache2/httpd
```

### Method 2: Fresh Install
```bash
# Backup current installation (optional)
sudo cp -r /var/www/crownai /var/www/crownai.backup

# Remove old files
sudo rm -rf /var/www/crownai/*

# Clone fresh copy
cd /tmp
git clone https://github.com/YOUR_USERNAME/CrownAI.git
sudo cp -r CrownAI/* /var/www/crownai/

# Set permissions
sudo chown -R www-data:www-data /var/www/crownai  # Ubuntu/Debian
sudo chown -R nginx:nginx /var/www/crownai        # CentOS/RHEL

# Restart web server
sudo systemctl restart nginx  # or apache2/httpd
```

---

## 🧪 Testing Your Deployment

### Check Server is Running
```bash
# Check web server status
sudo systemctl status nginx    # Nginx
sudo systemctl status apache2  # Apache (Ubuntu)
sudo systemctl status httpd    # Apache (CentOS)

# Check if port is listening
sudo netstat -tulpn | grep :80
# or
sudo ss -tulpn | grep :80
```

### Test from Server
```bash
# Test localhost
curl http://localhost/index.html

# Should return HTML content
```

### Test from Another Device
1. Find your server IP:
```bash
ip addr show
# or
hostname -I
```

2. Open browser on another device in your LAN:
```
http://YOUR_SERVER_IP/index.html
```

---

## 🐛 Troubleshooting

### Problem: Can't Connect from LAN

**Solution 1**: Check firewall
```bash
# Ubuntu/Debian
sudo ufw status
sudo ufw allow 80/tcp

# CentOS/RHEL
sudo firewall-cmd --list-all
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --reload
```

**Solution 2**: Check web server is running
```bash
sudo systemctl status nginx  # or apache2/httpd
sudo systemctl start nginx   # if not running
```

**Solution 3**: Verify IP address
```bash
# Get server IP
ip addr show | grep inet
```

### Problem: Permission Denied

**Solution**: Fix file permissions
```bash
# Nginx
sudo chown -R www-data:www-data /var/www/crownai
sudo chmod -R 755 /var/www/crownai

# Apache (Ubuntu)
sudo chown -R www-data:www-data /var/www/html/CrownAI
sudo chmod -R 755 /var/www/html/CrownAI

# Apache (CentOS)
sudo chown -R apache:apache /var/www/html/CrownAI
sudo chmod -R 755 /var/www/html/CrownAI
```

### Problem: 404 Not Found

**Solution 1**: Check file paths
```bash
ls -la /var/www/crownai/index.html
```

**Solution 2**: Verify Nginx/Apache config
```bash
# Nginx
sudo nginx -t
cat /etc/nginx/sites-available/crownai

# Apache
sudo apachectl -t
cat /etc/apache2/sites-available/crownai.conf
```

### Problem: Slow Performance

**Solution**: Enable compression in Nginx
```nginx
# Add to Nginx config
gzip on;
gzip_vary on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# Restart Nginx
sudo systemctl restart nginx
```

---

## 📊 Server Monitoring

### Check Access Logs
```bash
# Nginx
sudo tail -f /var/log/nginx/access.log

# Apache
sudo tail -f /var/log/apache2/access.log  # Ubuntu
sudo tail -f /var/log/httpd/access_log    # CentOS
```

### Check Error Logs
```bash
# Nginx
sudo tail -f /var/log/nginx/error.log

# Apache
sudo tail -f /var/log/apache2/error.log  # Ubuntu
sudo tail -f /var/log/httpd/error_log    # CentOS
```

---

## 🎯 Quick Reference

### Find Server IP
```bash
hostname -I
# or
ip addr show | grep "inet " | grep -v 127.0.0.1
```

### Restart Web Server
```bash
sudo systemctl restart nginx    # Nginx
sudo systemctl restart apache2  # Apache (Ubuntu)
sudo systemctl restart httpd    # Apache (CentOS)
```

### Check Web Server Status
```bash
sudo systemctl status nginx    # Nginx
sudo systemctl status apache2  # Apache (Ubuntu)
sudo systemctl status httpd    # Apache (CentOS)
```

### View Web Server Logs
```bash
sudo journalctl -u nginx -f    # Nginx
sudo journalctl -u apache2 -f  # Apache (Ubuntu)
sudo journalctl -u httpd -f    # Apache (CentOS)
```

---

## 🎉 Success!

If everything is working, you should be able to:
1. Open browser on any LAN device
2. Navigate to `http://YOUR_SERVER_IP/index.html`
3. See the CrownAI welcome screen
4. Play the game!

---

## 📞 Need Help?

- Check the troubleshooting section above
- Review server logs for errors
- Verify firewall settings
- Test from the server itself first (localhost)
- Make sure your device is on the same LAN

---

## 🚀 Next Steps

- Add SSL certificate for HTTPS (Let's Encrypt)
- Set up a custom domain name
- Configure reverse proxy
- Add authentication if needed
- Set up automatic updates

---

**Enjoy your CrownAI deployment!** 👑🎮

*For more information, see the main README.md*
