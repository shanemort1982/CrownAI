# 🚀 CrownAI - Quick Deploy to Linux Server

## 📍 Your Repository
**GitHub**: https://github.com/shanemort1982/CrownAI

## ⚡ Fastest Deployment (Python)

### On Your Linux Server:
```bash
# 1. Clone the repo
git clone https://github.com/shanemort1982/CrownAI.git
cd CrownAI

# 2. Start the server
python3 -m http.server 8080 --bind 0.0.0.0

# 3. Open firewall (if needed)
sudo ufw allow 8080/tcp  # Ubuntu/Debian
# or
sudo firewall-cmd --permanent --add-port=8080/tcp && sudo firewall-cmd --reload  # CentOS/RHEL
```

### Access from LAN:
```
http://YOUR_SERVER_IP:8080/index.html
```

### Find Your Server IP:
```bash
hostname -I
# or
ip addr show | grep "inet " | grep -v 127.0.0.1
```

---

## 🌐 Production Deployment (Nginx)

### Quick Setup:
```bash
# 1. Install Nginx
sudo apt update && sudo apt install -y nginx  # Ubuntu/Debian
# or
sudo yum install -y nginx  # CentOS/RHEL

# 2. Clone to web directory
sudo mkdir -p /var/www/crownai
cd /tmp
git clone https://github.com/shanemort1982/CrownAI.git
sudo cp -r CrownAI/* /var/www/crownai/

# 3. Set permissions
sudo chown -R www-data:www-data /var/www/crownai  # Ubuntu/Debian
# or
sudo chown -R nginx:nginx /var/www/crownai  # CentOS/RHEL

# 4. Create Nginx config
sudo nano /etc/nginx/sites-available/crownai
```

**Paste this config:**
```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;
    root /var/www/crownai;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

**Enable and restart:**
```bash
# Ubuntu/Debian
sudo ln -s /etc/nginx/sites-available/crownai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo ufw allow 'Nginx Full'

# CentOS/RHEL
sudo cp /etc/nginx/sites-available/crownai /etc/nginx/conf.d/crownai.conf
sudo nginx -t
sudo systemctl restart nginx
sudo firewall-cmd --permanent --add-service=http && sudo firewall-cmd --reload
```

### Access:
```
http://YOUR_SERVER_IP/index.html
```

---

## 🔍 Troubleshooting

### Can't Connect?
```bash
# Check if web server is running
sudo systemctl status nginx  # or python process

# Check firewall
sudo ufw status  # Ubuntu/Debian
sudo firewall-cmd --list-all  # CentOS/RHEL

# Check if port is open
sudo netstat -tulpn | grep :80  # or :8080
```

### Permission Issues?
```bash
sudo chmod -R 755 /var/www/crownai
sudo chown -R www-data:www-data /var/www/crownai  # Ubuntu/Debian
```

---

## 📖 Full Documentation

For complete step-by-step instructions, see:
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Comprehensive deployment guide

---

## ✅ Verify Deployment

1. **From server**: `curl http://localhost/index.html`
2. **From LAN device**: Open `http://YOUR_SERVER_IP/index.html` in browser
3. **Should see**: CrownAI welcome screen

---

**That's it! Your CrownAI game is now accessible on your LAN!** 🎮👑
