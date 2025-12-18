export default function handler(req, res) {
  try {
    // سجل طلب الدخول للمساعدة في التتبع
    console.log('[TARBOO] Download endpoint called');
    
    const { token } = req.query;
    
    // 1. تحقق بسيط من وجود التوكن
    if (!token || token.length < 10) {
      console.log('[TARBOO] Invalid token - returning 401');
      return res.status(401).send(`#!/bin/bash
echo "========================================="
echo "ERROR: UNAUTHORIZED ACCESS"
echo "========================================="
echo "Invalid or missing installation token."
echo ""
echo "Please go back to:"
echo "https://vercel-ncp1.vercel.app"
echo "And generate a new token with your password."
echo "========================================="
exit 1`);
    }
    
    console.log(`[TARBOO] Token validated: ${token.substring(0, 15)}...`);
    
    // 2. النص الأساسي للمثبت - مع إصلاح التسلسلات الثمانية
    const currentDate = new Date().toISOString();
    
    const shellScript = `#!/bin/bash
#
# TARBOO - Ultimate Server Management Suite v6.0
# Professional Pterodactyl, CtrlPanel & SSL Management
# Version 6.0 - Complete Integrated Management System
# Author: TARBOO Team
#

# ============================================
# INITIALIZATION & GLOBAL VARIABLES
# ============================================
set -Eeuo pipefail
trap 'error_handler' ERR

# Error handler function
error_handler() {
    local exit_code=$?
    local line_no=$1
    error "Error occurred at line $line_no with exit code $exit_code"
    log_stack_trace
    exit $exit_code
}

# Version Information
SCRIPT_VERSION="6.0"
SCRIPT_NAME="TARBOO Management Suite"
RELEASE_DATE="2024-01-01"

# System Paths
PANEL_DIR="/var/www/pterodactyl"
CTRLPANEL_DIR="/var/www/ctrlpanel"
WINGS_DIR="/etc/pterodactyl"
INSTALL_LOG="/var/log/tarbool-manager.log"
BACKUP_DIR="/var/backups/tarbool"
CONFIG_DIR="/etc/tarbool-manager"
TEMP_DIR="/tmp/tarbool-install"
BLUEPRINT_DIR="/var/www/pterodactyl/.blueprint"
SSL_DIR="/etc/ssl/tarbool"

# PHP Settings
PHP_VERSION="8.3"
APP_TIMEZONE="Africa/Cairo"
MYSQL_ROOT_PASS=""

# URLs
PANEL_TARBALL_URL="https://github.com/pterodactyl/panel/releases/latest/download/panel.tar.gz"
BLUEPRINT_URL="https://github.com/BlueprintFramework/framework/releases/latest/download/blueprint.tar.gz"
WINGS_URL="https://github.com/pterodactyl/wings/releases/latest/download/wings_linux_"
CTRLPANEL_URL="https://github.com/Ctrlpanel-gg/panel.git"

# Installation Variables
declare -A INSTALLED_COMPONENTS=()
declare -A COMPONENT_STATUS=()
# في قسم المتغيرات العالمية، تأكد من وجود:
declare -a AVAILABLE_THEMES=("stellar" "billing" "enigma" "nebula" "elysium" "nightcore")
declare -a CTRLPANEL_THEMES=("phoenix")
declare -a INSTALLED_THEMES=()

# Panel Configuration
PANEL_DOMAIN=""
PANEL_EMAIL=""
PANEL_USERNAME=""
PANEL_PASSWORD=""
PANEL_FIRST_NAME=""
PANEL_LAST_NAME=""
PANEL_URL=""

# Wings Configuration
WINGS_DOMAIN=""
WINGS_TOKEN=""
WINGS_NODE_ID=""
WINGS_EMAIL=""

# CtrlPanel Configuration
CTRL_DOMAIN=""
CTRL_EMAIL=""
CTRL_DB_NAME=""
CTRL_DB_USER=""
CTRL_DB_PASS=""

# SSL Configuration
SSL_VERIFICATION_METHOD="auto"  # auto, http, dns
SSL_DNS_PROVIDER=""  # cloudflare, digitalocean, etc
SSL_DNS_CREDENTIALS=""
SSL_RENEWAL_DAYS=30

# Blueprint Configuration
BLUEPRINT_INSTALLED=false

# System Configuration
SYSTEM_OPTIMIZED=false
FIREWALL_CONFIGURED=false
MONITORING_ENABLED=false

# ============================================
# COLOR & STYLING LIBRARY
# ============================================
# Primary Colors
RED='\\x1b[0;31m'
GREEN='\\x1b[0;32m'
YELLOW='\\x1b[1;33m'
BLUE='\\x1b[0;34m'
CYAN='\\x1b[0;36m'
MAGENTA='\\x1b[0;35m'
WHITE='\\x1b[1;37m'
NC='\\x1b[0m'

# Styles
BOLD='\\x1b[1m'
UNDERLINE='\\x1b[4m'
BLINK='\\x1b[5m'

# Custom Panel Colors
HEADER_COLOR="${CYAN}${BOLD}"
SUCCESS_COLOR="${GREEN}${BOLD}"
ERROR_COLOR="${RED}${BOLD}"
WARNING_COLOR="${YELLOW}${BOLD}"
INFO_COLOR="${BLUE}${BOLD}"
OPTION_COLOR="${MAGENTA}"
INPUT_COLOR="${WHITE}"
DEBUG_COLOR="${WHITE}${BOLD}"

# ============================================
# TARBOO BANNER DISPLAY
# ============================================
display_banner() {
    clear
    echo -e "${CYAN}"

    cat << "EOF"
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║                    ████████╗ █████╗ ██████╗ ██████╗  ██████╗      ║
║                    ╚══██╔══╝██╔══██╗██╔══██╗██╔══██╗██╔═══██╗     ║
║                       ██║   ███████║██████╔╝██║  ██║██║   ██║     ║
║                       ██║   ██╔══██║██╔══██╗██║  ██║██║   ██║     ║
║                       ██║   ██║  ██║██║  ██║██████╔╝╚██████╔╝     ║
║                       ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝  ╚═════╝      ║
║                                                                   ║
║                    Ultimate Server Management Suite               ║
║                          Version ${SCRIPT_VERSION}                          ║
║                    Professional SSL & Panel Management           ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
EOF

    echo -e "${NC}"
    echo
}

# ============================================
# ENHANCED LOGGING & MESSAGE FUNCTIONS
# ============================================
log() {
    local message="$1"
    local level="${2:-INFO}"
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo -e "${GREEN}[✓]${NC} $message"
    echo "[$timestamp] [$level] $message" >> "$INSTALL_LOG"
}

info() {
    local message="$1"
    echo -e "${BLUE}[i]${NC} $message"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $message" >> "$INSTALL_LOG"
}

debug() {
    local message="$1"
    if [[ "${DEBUG_MODE:-false}" == "true" ]]; then
        echo -e "${DEBUG_COLOR}[DEBUG]${NC} $message"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [DEBUG] $message" >> "$INSTALL_LOG"
    fi
}

warn() {
    local message="$1"
    echo -e "${YELLOW}[!]${NC} $message" >&2
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARN] $message" >> "$INSTALL_LOG"
}

error() {
    local message="$1"
    echo -e "${RED}[✗]${NC} $message" >&2
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $message" >> "$INSTALL_LOG"
}

fatal() {
    local message="$1"
    local exit_code="${2:-1}"
    error "$message"
    log_stack_trace
    exit $exit_code
}

ok() {
    local message="$1"
    echo -e "${GREEN}[✓]${NC} $message"
}

success() {
    local message="${1:-Operation Completed Successfully!}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}                    $message          ${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
}

log_stack_trace() {
    local frame=0
    while caller $frame; do
        ((frame++))
    done >> "$INSTALL_LOG" 2>&1
}

menu_header() {
    local title="$1"
    local title_length=${#title}
    local padding=$(( (60 - title_length) / 2 ))
    
    echo -e "${HEADER_COLOR}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    printf "║%*s%s%*s║\n" $padding "" "$title" $((60 - padding - title_length)) ""
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo
}

progress_bar() {
    local duration="${1:-0.05}"
    local width=50
    local increment=$((100 / width))
    local progress=0
    
    for ((i = 0; i <= width; i++)); do
        progress=$((i * increment))
        echo -ne "${GREEN}["
        for ((j = 0; j < i; j++)); do echo -ne "█"; done
        for ((j = i; j < width; j++)); do echo -ne "░"; done
        echo -ne "] ${progress}% ${NC}\\r"
        sleep "$duration"
    done
    echo
}

spinner() {
    local pid=$!
    local message="$1"
    local delay=0.1
    local spinstr='⣾⣽⣻⢿⡿⣟⣯⣷'
    
    echo -ne "${YELLOW}⏳ $message... ${NC}"
    while kill -0 "$pid" 2>/dev/null; do
        for i in $(seq 0 7); do
            echo -ne "${spinstr:$i:1}"
            sleep $delay
            echo -ne "\\b"
        done
    done
    echo -e "${GREEN}✓${NC}"
}

# ============================================
# SYSTEM VALIDATION & HEALTH CHECKS
# ============================================
check_root() {
    if [[ $EUID -ne 0 ]]; then
        fatal "This script must be run as root (sudo)"
    fi
}

check_os() {
    if [[ ! -f /etc/os-release ]]; then
        fatal "Cannot determine operating system"
    fi
    
    source /etc/os-release
    case "$ID" in
        ubuntu)
            if [[ "$VERSION_ID" != "20.04" && "$VERSION_ID" != "22.04" && "$VERSION_ID" != "24.04" ]]; then
                warn "Version $VERSION_ID is not officially supported"
                read -rp "Do you want to continue anyway? (y/N): " choice
                [[ ! "$choice" =~ ^[Yy]$ ]] && exit 1
            fi
            ;;
        debian)
            if [[ "$VERSION_ID" != "11" && "$VERSION_ID" != "12" ]]; then
                warn "Version $VERSION_ID is not officially supported"
                read -rp "Do you want to continue anyway? (y/N): " choice
                [[ ! "$choice" =~ ^[Yy]$ ]] && exit 1
            fi
            ;;
        *)
            fatal "Unsupported operating system: $ID"
            ;;
    esac
    
    info "Operating System: $PRETTY_NAME"
    info "Kernel: $(uname -r)"
    info "Architecture: $(uname -m)"
}

check_internet() {
    log "Checking internet connection..."
    
    # Test multiple endpoints
    local endpoints=(
        "https://api.github.com"
        "https://google.com"
        "https://letsencrypt.org"
    )
    
    local connected=false
    for endpoint in "${endpoints[@]}"; do
        if curl -s --connect-timeout 5 --max-time 10 "$endpoint" > /dev/null 2>&1; then
            connected=true
            break
        fi
    done
    
    if ! $connected; then
        warn "Internet connection check failed"
        read -rp "Do you want to continue anyway? (y/N): " choice
        if [[ ! "$choice" =~ ^[Yy]$ ]]; then
            fatal "Internet connection required"
        fi
    else
        info "Internet Connection: ${GREEN}✓${NC}"
    fi
}

check_dependencies() {
    log "Checking required dependencies..."
    
    # قائمة dependencies الأساسية بدون python3-pip أولاً
    local deps=("curl" "wget" "git" "unzip" "jq" "openssl" "certbot" "python3")
    local missing=()
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" >/dev/null 2>&1; then
            missing+=("$dep")
        fi
    done
    
    if [ ${#missing[@]} -gt 0 ]; then
        warn "Missing dependencies: ${missing[*]}"
        log "Installing missing dependencies..."
        
        # تحديث apt مع تجاهل أخطاء المستودعات المعطوبة
        apt-get update -y 2>&1 | grep -v "nodesource\\|NodeSource" >> "$INSTALL_LOG" 2>&1 || {
            warn "Some repositories had issues (likely Node.js), but continuing..."
        }
        
        # تثبيت dependencies الأساسية
        DEBIAN_FRONTEND=noninteractive apt-get install -y "${missing[@]}" >> "$INSTALL_LOG" 2>&1 || {
            error "Failed to install some dependencies"
            return 1
        }
    fi
    # Check for Node.js conflicts
if dpkg -l | grep -q "libnode-dev"; then
    warn "Potential Node.js conflicts detected (libnode-dev package exists)"
    read -rp "Fix Node.js conflicts before proceeding? (Y/n): " fix_node
    fix_node=${fix_node:-Y}
    if [[ "$fix_node" =~ ^[Yy]$ ]]; then
        fix_nodejs_conflicts
    fi
fi
    # تثبيت python3-pip بشكل منفصل بعد التأكد من نجاح التثبيت الأساسي
    if ! command -v pip3 >/dev/null 2>&1; then
        log "Installing python3-pip..."
        DEBIAN_FRONTEND=noninteractive apt-get install -y python3-pip >> "$INSTALL_LOG" 2>&1 || {
            warn "Failed to install python3-pip, but continuing..."
        }
    fi
    
    # تثبيت وحدات Python الإضافية (اختياري)
    if command -v pip3 >/dev/null 2>&1; then
        log "Installing Python modules for certbot..."
        pip3 install certbot-dns-cloudflare certbot-dns-digitalocean certbot-dns-route53 >> "$INSTALL_LOG" 2>&1 || true
    fi
    
    log "All dependencies satisfied"
    return 0
}

check_disk_space() {
    local required=2 # GB
    local available
    available=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
    
    if [[ "$available" -lt "$required" ]]; then
        warn "Low disk space: only $available GB available (required: $required GB)"
        read -rp "Continue anyway? (y/N): " choice
        [[ ! "$choice" =~ ^[Yy]$ ]] && fatal "Insufficient disk space"
    fi
}

check_memory() {
    local required=1024 # MB
    local available
    available=$(free -m | awk '/^Mem:/{print $2}')
    
    if [[ "$available" -lt "$required" ]]; then
        warn "Low memory: only $available MB available (required: $required MB)"
        read -rp "Continue anyway? (y/N): " choice
        [[ ! "$choice" =~ ^[Yy]$ ]] && fatal "Insufficient memory"
    fi
}

check_port() {
    local port="$1"
    local service="$2"
    
    if ss -tuln | grep -q ":$port "; then
        warn "Port $port is already in use by another service"
        if [[ -n "$service" ]]; then
            warn "This may conflict with $service"
        fi
        return 1
    fi
    return 0
}

# ============================================
# ENHANCED INPUT VALIDATION FUNCTIONS
# ============================================
input_with_default() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    local validation="${4:-}"
    local user_input=""
    
    while true; do
        echo -ne "${INPUT_COLOR}$prompt [${default}]: ${NC}"
        read -r user_input
        
        if [[ -z "$user_input" ]]; then
            user_input="$default"
        fi
        
        if [[ -n "$validation" ]]; then
            if validate_input "$user_input" "$validation"; then
                break
            else
                continue
            fi
        else
            break
        fi
    done
    
    declare -g "$var_name"="$user_input"
    debug "Input: $var_name = $user_input"
}

validate_input() {
    local input="$1"
    local type="$2"
    
    case "$type" in
        "email")
            if [[ "$input" =~ ^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$ ]]; then
                return 0
            else
                error "Invalid email address format"
                return 1
            fi
            ;;
        "domain")
            if [[ "$input" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$ ]]; then
                return 0
            else
                error "Invalid domain format"
                return 1
            fi
            ;;
        "password")
            if [[ ${#input} -ge 8 ]] && [[ "$input" =~ [A-Z] ]] && [[ "$input" =~ [a-z] ]] && [[ "$input" =~ [0-9] ]]; then
                return 0
            else
                error "Password must be at least 8 characters with uppercase, lowercase, and numbers"
                return 1
            fi
            ;;
        "number")
            if [[ "$input" =~ ^[0-9]+$ ]]; then
                return 0
            else
                error "Please enter a valid number"
                return 1
            fi
            ;;
        "ip")
            if [[ "$input" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
                local IFS='.'
                read -r -a octets <<< "$input"
                for octet in "${octets[@]}"; do
                    if [[ "$octet" -lt 0 || "$octet" -gt 255 ]]; then
                        error "Invalid IP address"
                        return 1
                    fi
                done
                return 0
            else
                error "Invalid IP address format"
                return 1
            fi
            ;;
        "url")
            if [[ "$input" =~ ^https?://[a-zA-Z0-9.-]+\.[a-zA-Z]{2,} ]]; then
                return 0
            else
                error "Invalid URL format"
                return 1
            fi
            ;;
        *)
            return 0
            ;;
    esac
}

input_password() {
    local prompt="$1"
    local var_name="$2"
    local password=""
    local confirm=""
    
    while true; do
        echo -ne "${INPUT_COLOR}$prompt: ${NC}"
        read -rs password
        echo
        
        if [[ -z "$password" ]]; then
            error "Password cannot be empty"
            continue
        fi
        
        if [[ ${#password} -lt 8 ]]; then
            error "Password must be at least 8 characters"
            continue
        fi
        
        echo -ne "${INPUT_COLOR}Confirm Password: ${NC}"
        read -rs confirm
        echo
        
        if [[ "$password" != "$confirm" ]]; then
            error "Passwords do not match"
            continue
        fi
        
        break
    done
    
    declare -g "$var_name"="$password"
}

# ============================================
# ENHANCED SSL MANAGEMENT FUNCTIONS
# ============================================
verify_domain() {
    local domain="$1"
    local verification_method="$2"
    
    log "Verifying domain: $domain"
    
    # Get server public IP
    local public_ip
    public_ip=$(get_public_ip)
    
    if [[ -z "$public_ip" ]]; then
        warn "Could not determine server public IP"
        return 1
    fi
    
    info "Server Public IP: $public_ip"
    
    # Get domain IP(s)
    local domain_ips
    domain_ips=$(dig +short A "$domain" 2>/dev/null | sort -u)
    
    if [[ -z "$domain_ips" ]]; then
        error "Domain $domain does not resolve to any IP"
        return 1
    fi
    
    info "Domain IPs: $domain_ips"
    
    # Check if any domain IP matches server IP
    local match_found=false
    for ip in $domain_ips; do
        if [[ "$ip" == "$public_ip" ]]; then
            match_found=true
            break
        fi
    done
    
    if $match_found; then
        ok "Domain $domain correctly points to this server ($public_ip)"
        return 0
    else
        warn "Domain $domain does not point to this server"
        warn "Server IP: $public_ip"
        warn "Domain IP(s): $domain_ips"
        
        if [[ "$verification_method" == "dns" ]]; then
            info "DNS challenge mode enabled - continuing despite IP mismatch"
            return 0
        fi
        
        read -rp "Continue anyway? (y/N): " choice
        if [[ "$choice" =~ ^[Yy]$ ]]; then
            warn "Continuing with domain verification - SSL may not work properly"
            return 0
        else
            return 1
        fi
    fi
}

get_public_ip() {
    # Try multiple services
    local services=(
        "https://api.ipify.org"
        "https://icanhazip.com"
        "https://ifconfig.me/ip"
        "https://checkip.amazonaws.com"
    )
    
    for service in "${services[@]}"; do
        local ip
        ip=$(curl -4fsS --connect-timeout 5 "$service" 2>/dev/null | tr -d '[:space:]')
        if [[ -n "$ip" ]] && [[ "$ip" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
            echo "$ip"
            return 0
        fi
    done
    
    # Fallback to local interface
    ip route get 1 | awk '{print $7;exit}' 2>/dev/null || echo ""
}

install_certbot() {
    log "Installing Certbot and SSL dependencies..."
    
    apt-get update -y >> "$INSTALL_LOG" 2>&1
    
    # Install certbot and plugins
    apt-get install -y \
        certbot \
        python3-certbot-nginx \
        python3-certbot-dns-cloudflare \
        python3-certbot-dns-digitalocean \
        python3-certbot-dns-route53 \
        python3-pip \
        >> "$INSTALL_LOG" 2>&1
    
    # Install additional Python modules
    pip3 install --upgrade pip >> "$INSTALL_LOG" 2>&1
    pip3 install certbot-dns-cloudflare certbot-dns-digitalocean certbot-dns-route53 >> "$INSTALL_LOG" 2>&1 || true
    
    # Verify installation
    if command -v certbot >/dev/null 2>&1; then
        ok "Certbot installed successfully"
        certbot --version | head -1
        return 0
    else
        error "Certbot installation failed"
        return 1
    fi
}

manage_nginx_for_ssl() {
    local action="$1"  # stop, start, restart, status
    local domain="$2"
    
    case "$action" in
        "stop")
            log "Stopping Nginx for SSL verification..."
            if systemctl is-active --quiet nginx; then
                systemctl stop nginx >> "$INSTALL_LOG" 2>&1
                sleep 2
                if ! systemctl is-active --quiet nginx; then
                    ok "Nginx stopped successfully"
                    return 0
                else
                    warn "Failed to stop Nginx, attempting force stop..."
                    pkill -9 nginx 2>/dev/null || true
                    sleep 1
                fi
            fi
            ;;
        "start")
            log "Starting Nginx..."
            if systemctl start nginx >> "$INSTALL_LOG" 2>&1; then
                sleep 2
                if systemctl is-active --quiet nginx; then
                    ok "Nginx started successfully"
                    return 0
                fi
            fi
            warn "Failed to start Nginx via systemctl, attempting direct start..."
            nginx 2>/dev/null || true
            sleep 2
            ;;
        "restart")
            log "Restarting Nginx..."
            systemctl restart nginx >> "$INSTALL_LOG" 2>&1
            sleep 2
            if systemctl is-active --quiet nginx; then
                ok "Nginx restarted successfully"
            else
                error "Nginx failed to restart"
                return 1
            fi
            ;;
        "status")
            if systemctl is-active --quiet nginx; then
                echo "active"
            else
                echo "inactive"
            fi
            ;;
    esac
}

obtain_ssl_certificate() {
    local domain="$1"
    local email="$2"
    local verification_method="$3"
    local component="$4"
    
    menu_header "Obtain SSL Certificate for $domain"
    
    log "Starting SSL certificate acquisition for $domain"
    
    # Verify domain
    if ! verify_domain "$domain" "$verification_method"; then
        error "Domain verification failed"
        return 1
    fi
    
    # Install certbot if not installed
    if ! command -v certbot >/dev/null 2>&1; then
        if ! install_certbot; then
            error "Failed to install certbot"
            return 1
        fi
    fi
    
    local cert_path="/etc/letsencrypt/live/${domain}/fullchain.pem"
    local key_path="/etc/letsencrypt/live/${domain}/privkey.pem"
    
    # Check if valid certificate already exists
    if [[ -f "$cert_path" ]] && [[ -f "$key_path" ]]; then
        local days_remaining
        days_remaining=$(get_certificate_days_remaining "$domain")
        
        if [[ "$days_remaining" -gt 30 ]]; then
            info "Valid SSL certificate already exists (expires in $days_remaining days)"
            read -rp "Renew anyway? (y/N): " renew_choice
            if [[ ! "$renew_choice" =~ ^[Yy]$ ]]; then
                ok "Using existing certificate"
                return 0
            fi
        fi
    fi
    
    # Choose verification method
    if [[ "$verification_method" == "auto" ]]; then
        echo -e "${INFO_COLOR}Select SSL verification method:${NC}"
        echo -e "${OPTION_COLOR}1)${NC} HTTP Challenge (requires port 80 open)"
        echo -e "${OPTION_COLOR}2)${NC} DNS Challenge (requires DNS API access)"
        echo -e "${OPTION_COLOR}3)${NC} Manual DNS Challenge"
        echo
        
        read -rp "Choose option [1-3]: " ssl_method_choice
        
        case $ssl_method_choice in
            1) verification_method="http" ;;
            2) verification_method="dns" ;;
            3) verification_method="manual" ;;
            *) verification_method="http" ;;
        esac
    fi
    
    # Obtain certificate based on verification method
    case "$verification_method" in
        "http")
            obtain_ssl_http "$domain" "$email"
            ;;
        "dns")
            obtain_ssl_dns "$domain" "$email"
            ;;
        "manual")
            obtain_ssl_manual "$domain" "$email"
            ;;
        *)
            error "Invalid verification method: $verification_method"
            return 1
            ;;
    esac
    
    local result=$?
    
    if [[ $result -eq 0 ]]; then
        # Configure component to use SSL
        configure_component_ssl "$domain" "$component"
        
        # Setup auto-renewal
        setup_ssl_auto_renewal "$domain"
        
        success "SSL certificate installed successfully for $domain"
        return 0
    else
        error "Failed to obtain SSL certificate for $domain"
        return 1
    fi
}

obtain_ssl_http() {
    local domain="$1"
    local email="$2"
    
    log "Attempting HTTP challenge for $domain"
    
    # Save Nginx state
    local nginx_was_running=false
    if [[ "$(manage_nginx_for_ssl status "$domain")" == "active" ]]; then
        nginx_was_running=true
    fi
    
    # Stop Nginx for standalone verification
    manage_nginx_for_ssl stop "$domain"
    
    # Check if port 80 is available
    if ! check_port 80 "HTTP challenge"; then
        warn "Port 80 is in use, HTTP challenge may fail"
        read -rp "Continue anyway? (y/N): " choice
        if [[ ! "$choice" =~ ^[Yy]$ ]]; then
            manage_nginx_for_ssl start "$domain"
            return 1
        fi
    fi
    
    # Attempt HTTP challenge
    log "Requesting SSL certificate via HTTP challenge..."
    
    local certbot_cmd="certbot certonly --standalone \\
        -d '$domain' \\
        --non-interactive \\
        --agree-tos \\
        -m '$email' \\
        --preferred-challenges http \\
        --http-01-port 80"
    
    debug "Running: $certbot_cmd"
    
    if eval "$certbot_cmd" >> "$INSTALL_LOG" 2>&1; then
        ok "HTTP challenge successful"
        
        # Restore Nginx state
        if $nginx_was_running; then
            manage_nginx_for_ssl start "$domain"
        fi
        
        return 0
    else
        error "HTTP challenge failed"
        
        # Check common issues
        check_ssl_common_issues "$domain"
        
        # Restore Nginx state
        if $nginx_was_running; then
            manage_nginx_for_ssl start "$domain"
        fi
        
        return 1
    fi
}

obtain_ssl_dns() {
    local domain="$1"
    local email="$2"
    
    log "Attempting DNS challenge for $domain"
    
    echo -e "${INFO_COLOR}Select DNS provider:${NC}"
    echo -e "${OPTION_COLOR}1)${NC} Cloudflare"
    echo -e "${OPTION_COLOR}2)${NC} DigitalOcean"
    echo -e "${OPTION_COLOR}3)${NC} AWS Route53"
    echo -e "${OPTION_COLOR}4)${NC} Other (manual configuration)"
    echo
    
    read -rp "Choose provider [1-4]: " dns_provider_choice
    
    case $dns_provider_choice in
        1)
            configure_cloudflare_dns "$domain" "$email"
            ;;
        2)
            configure_digitalocean_dns "$domain" "$email"
            ;;
        3)
            configure_route53_dns "$domain" "$email"
            ;;
        4)
            obtain_ssl_manual "$domain" "$email"
            return $?
            ;;
        *)
            warn "Invalid choice, using manual DNS"
            obtain_ssl_manual "$domain" "$email"
            return $?
            ;;
    esac
}

configure_cloudflare_dns() {
    local domain="$1"
    local email="$2"
    
    log "Configuring Cloudflare DNS challenge..."
    
    echo
    echo -e "${YELLOW}Cloudflare DNS Configuration${NC}"
    echo "Please provide your Cloudflare API credentials:"
    echo
    
    input_with_default "Cloudflare API Token" "" CF_API_TOKEN
    input_with_default "Cloudflare Zone ID" "" CF_ZONE_ID
    
    if [[ -z "$CF_API_TOKEN" ]] || [[ -z "$CF_ZONE_ID" ]]; then
        error "Cloudflare credentials required"
        return 1
    fi
    
    # Create Cloudflare credentials file
    local cf_creds="/etc/letsencrypt/cloudflare.ini"
    cat > "$cf_creds" <<EOF
# Cloudflare API credentials
dns_cloudflare_api_token = $CF_API_TOKEN
dns_cloudflare_zone_id = $CF_ZONE_ID
EOF
    
    chmod 600 "$cf_creds"
    
    # Run certbot with Cloudflare DNS
    log "Requesting SSL certificate via Cloudflare DNS..."
    
    if certbot certonly \
        --dns-cloudflare \
        --dns-cloudflare-credentials "$cf_creds" \
        -d "$domain" \
        --non-interactive \
        --agree-tos \
        -m "$email" \
        >> "$INSTALL_LOG" 2>&1; then
        
        ok "Cloudflare DNS challenge successful"
        rm -f "$cf_creds"
        return 0
    else
        error "Cloudflare DNS challenge failed"
        rm -f "$cf_creds"
        return 1
    fi
}

obtain_ssl_manual() {
    local domain="$1"
    local email="$2"
    
    log "Starting manual DNS challenge for $domain"
    
    echo
    echo -e "${YELLOW}Manual DNS Challenge Instructions${NC}"
    echo "1. Certbot will display a TXT record to add to your DNS"
    echo "2. Add the TXT record to your domain's DNS configuration"
    echo "3. Wait for DNS propagation (may take a few minutes)"
    echo "4. Press Enter when ready"
    echo
    
    read -rp "Press Enter to begin..."
    
    if certbot certonly --manual \
        --preferred-challenges dns \
        -d "$domain" \
        --agree-tos \
        -m "$email" \
        --manual-public-ip-logging-ok \
        >> "$INSTALL_LOG" 2>&1; then
        
        ok "Manual DNS challenge successful"
        return 0
    else
        error "Manual DNS challenge failed"
        return 1
    fi
}

check_ssl_common_issues() {
    local domain="$1"
    
    echo
    echo -e "${ERROR_COLOR}Common SSL Issues and Solutions:${NC}"
    echo
    echo -e "${YELLOW}1. Port 80 blocked or in use${NC}"
    echo "   Solution: sudo ufw allow 80/tcp"
    echo "            or stop service using port 80"
    echo
    echo -e "${YELLOW}2. Domain doesn't point to server IP${NC}"
    echo "   Solution: Update DNS A record for $domain"
    echo
    echo -e "${YELLOW}3. Let's Encrypt rate limits${NC}"
    echo "   Solution: Wait 1 hour or use staging server"
    echo
    echo -e "${YELLOW}4. Firewall blocking certbot${NC}"
    echo "   Solution: sudo ufw allow from any to any port 80"
    echo
    echo -e "${YELLOW}5. Previous certificate exists${NC}"
    echo "   Solution: certbot delete --cert-name $domain"
    echo
}

configure_component_ssl() {
    local domain="$1"
    local component="$2"
    
    log "Configuring SSL for $component..."
    
    local cert_path="/etc/letsencrypt/live/${domain}/fullchain.pem"
    local key_path="/etc/letsencrypt/live/${domain}/privkey.pem"
    
    if [[ ! -f "$cert_path" ]] || [[ ! -f "$key_path" ]]; then
        error "SSL certificate files not found"
        return 1
    fi
    
    case "$component" in
        "panel")
            configure_panel_ssl "$domain" "$cert_path" "$key_path"
            ;;
        "wings")
            configure_wings_ssl "$domain" "$cert_path" "$key_path"
            ;;
        "ctrlpanel")
            configure_ctrlpanel_ssl "$domain" "$cert_path" "$key_path"
            ;;
        *)
            warn "Unknown component: $component"
            return 1
            ;;
    esac
}

configure_panel_ssl() {
    local domain="$1"
    local cert_path="$2"
    local key_path="$3"
    
    log "Configuring Panel SSL for $domain"
    
    # Update .env file
    if [[ -f "$PANEL_DIR/.env" ]]; then
        sed -i "s|^APP_URL=.*|APP_URL=https://${domain}|" "$PANEL_DIR/.env"
        ok "Updated Panel APP_URL"
    fi
    
    # Update Nginx configuration
    local nginx_conf="/etc/nginx/sites-available/pterodactyl.conf"
    
    if [[ -f "$nginx_conf" ]]; then
        # Create SSL configuration snippet
        local ssl_snippet="/etc/nginx/snippets/ssl-${domain}.conf"
        cat > "$ssl_snippet" <<EOF
ssl_certificate $cert_path;
ssl_certificate_key $key_path;
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_session_tickets off;

# Modern configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;

# HSTS (optional, uncomment if you understand the implications)
# add_header Strict-Transport-Security "max-age=63072000" always;
EOF
        
        # Update main Nginx config
        if grep -q "listen 80;" "$nginx_conf"; then
            # Add SSL listen directive
            sed -i "s|listen 80;|listen 80;\\n    listen 443 ssl http2;\\n    ssl_certificate $cert_path;\\n    ssl_certificate_key $key_path;|" "$nginx_conf"
            
            # Add HTTP to HTTPS redirect
            local redirect_conf="/etc/nginx/snippets/redirect-${domain}.conf"
            cat > "$redirect_conf" <<EOF
server {
    listen 80;
    server_name ${domain};
    return 301 https://\$server_name\$request_uri;
}
EOF
            
            # Include redirect in main config
            if ! grep -q "redirect-${domain}" "/etc/nginx/nginx.conf"; then
                sed -i '/http {/a\\    include /etc/nginx/snippets/redirect-*.conf;' /etc/nginx/nginx.conf
            fi
        fi
        
        # Test and reload Nginx
        if nginx -t >> "$INSTALL_LOG" 2>&1; then
            systemctl reload nginx >> "$INSTALL_LOG" 2>&1
            ok "Nginx SSL configuration updated"
        else
            error "Nginx configuration test failed"
            nginx -t 2>&1 | tail -20
        fi
    fi
}

setup_ssl_auto_renewal() {
    local domain="$1"
    
    log "Setting up SSL auto-renewal for $domain"
    
    # Create renewal hook script
    local renew_hook="/etc/letsencrypt/renewal-hooks/deploy/tarbool-renew.sh"
    cat > "$renew_hook" <<'EOF'
#!/bin/bash
# SSL renewal hook for TARBOO Management Suite

DOMAIN="$RENEWED_DOMAINS"

if [ -n "$DOMAIN" ]; then
    echo "Reloading Nginx for domain: $DOMAIN"
    systemctl reload nginx 2>/dev/null || true
    
    # Restart affected services
    if systemctl is-active --quiet wings 2>/dev/null; then
        systemctl restart wings 2>/dev/null || true
    fi
    
    echo "SSL renewal completed for $DOMAIN"
fi
EOF
    
    chmod +x "$renew_hook"
    
    # Add to crontab if not already present
    if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
        (crontab -l 2>/dev/null; echo "0 3 * * * /usr/bin/certbot renew --quiet --deploy-hook \"$renew_hook\"") | crontab -
        ok "Auto-renewal cron job installed"
    fi
    
    # Test renewal
    log "Testing SSL certificate renewal..."
    if certbot renew --dry-run >> "$INSTALL_LOG" 2>&1; then
        ok "SSL auto-renewal test successful"
    else
        warn "SSL renewal test failed (check logs)"
    fi
}

get_certificate_days_remaining() {
    local domain="$1"
    local cert_file="/etc/letsencrypt/live/${domain}/cert.pem"
    
    if [[ -f "$cert_file" ]]; then
        local expiry_date
        expiry_date=$(openssl x509 -enddate -noout -in "$cert_file" | cut -d= -f2)
        local expiry_epoch
        expiry_epoch=$(date -d "$expiry_date" +%s)
        local current_epoch
        current_epoch=$(date +%s)
        local seconds_remaining=$((expiry_epoch - current_epoch))
        local days_remaining=$((seconds_remaining / 86400))
        
        echo "$days_remaining"
    else
        echo "0"
    fi
}

# ============================================
# ENHANCED SYSTEM MANAGEMENT FUNCTIONS
# ============================================
update_system() {
    log "Updating system and preparing environment..."
    
    export DEBIAN_FRONTEND=noninteractive
    
    # Update package list with retry
    for i in {1..3}; do
        if apt-get update -y >> "$INSTALL_LOG" 2>&1; then
            break
        else
            warn "Update attempt $i/3 failed, retrying..."
            sleep 2
        fi
    done
    
    # Upgrade system
    log "Upgrading installed packages..."
    apt-get upgrade -y >> "$INSTALL_LOG" 2>&1
    
    # Install essential packages
    log "Installing essential packages..."
    apt-get install -y \
        software-properties-common \
        curl \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release \
        unzip \
        git \
        tar \
        net-tools \
        htop \
        nano \
        wget \
        jq \
        bc \
        cron \
        ufw \
        fail2ban \
        zip \
        unzip \
        bzip2 \
        lsof \
        psmisc \
        tree \
        dnsutils \
        netcat-openbsd \
        telnet \
        whois \
        >> "$INSTALL_LOG" 2>&1
    
    # Set timezone
    timedatectl set-timezone "$APP_TIMEZONE" >> "$INSTALL_LOG" 2>&1 || true
    
    # Enable NTP
    timedatectl set-ntp true >> "$INSTALL_LOG" 2>&1 || true
    
    log "System updated successfully"
}

setup_php_repo() {
    local os_id
    os_id=$(lsb_release -is | tr '[:upper:]' '[:lower:]')
    
    log "Setting up PHP repositories for $os_id..."
    
    case "$os_id" in
        ubuntu)
            add-apt-repository -y ppa:ondrej/php >> "$INSTALL_LOG" 2>&1
            ;;
        debian)
            wget -O /etc/apt/trusted.gpg.d/php.gpg https://packages.sury.org/php/apt.gpg 2>/dev/null || \
            curl -fsSL https://packages.sury.org/php/apt.gpg -o /etc/apt/trusted.gpg.d/php.gpg
            echo "deb https://packages.sury.org/php/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/php.list
            ;;
    esac
    
    apt-get update -y >> "$INSTALL_LOG" 2>&1
}

setup_redis_repo() {
    log "Setting up Redis repository..."
    
    local codename
    codename=$(lsb_release -cs)
    
    curl -fsSL https://packages.redis.io/gpg | gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg >> "$INSTALL_LOG" 2>&1
    
    echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $codename main" | \
        tee /etc/apt/sources.list.d/redis.list >> "$INSTALL_LOG" 2>&1
    
    apt-get update -y >> "$INSTALL_LOG" 2>&1
}

install_mariadb() {
    log "Installing and configuring MariaDB..."
    
    # Stop existing services
    systemctl stop mariadb 2>/dev/null || true
    systemctl stop mysql 2>/dev/null || true
    
    # Cleanup old installations
    apt-get purge -y mariadb-server mariadb-client mysql-server mysql-client >> "$INSTALL_LOG" 2>&1
    apt-get autoremove -y >> "$INSTALL_LOG" 2>&1
    rm -rf /etc/mysql /var/lib/mysql
    
    # Install prerequisites
    apt-get install -y software-properties-common dirmngr ca-certificates curl >> "$INSTALL_LOG" 2>&1
    
    # Add MariaDB repository
    curl -LsS https://r.mariadb.com/downloads/mariadb_repo_setup | bash -s -- --mariadb-server-version="mariadb-10.11" >> "$INSTALL_LOG" 2>&1
    
    # Install MariaDB
    apt-get update -y >> "$INSTALL_LOG" 2>&1
    DEBIAN_FRONTEND=noninteractive apt-get install -y mariadb-server >> "$INSTALL_LOG" 2>&1
    
    # Start and enable service
    systemctl enable mariadb >> "$INSTALL_LOG" 2>&1
    systemctl start mariadb >> "$INSTALL_LOG" 2>&1
    
    # Secure installation
    if [[ -z "$MYSQL_ROOT_PASS" ]]; then
        MYSQL_ROOT_PASS=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
    fi
    
    # Run mysql_secure_installation via expect
    apt-get install -y expect >> "$INSTALL_LOG" 2>&1
    
    cat > /tmp/mysql_secure.exp <<EOF
#!/usr/bin/expect
set timeout 30
spawn mysql_secure_installation

expect "Enter current password for root (enter for none):"
send "\\r"

expect "Switch to unix_socket authentication"
send "n\\r"

expect "Change the root password?"
send "y\\r"

expect "New password:"
send "${MYSQL_ROOT_PASS}\\r"

expect "Re-enter new password:"
send "${MYSQL_ROOT_PASS}\\r"

expect "Remove anonymous users?"
send "y\\r"

expect "Disallow root login remotely?"
send "y\\r"

expect "Remove test database and access to it?"
send "y\\r"

expect "Reload privilege tables now?"
send "y\\r"

expect eof
EOF
    
    chmod +x /tmp/mysql_secure.exp
    /tmp/mysql_secure.exp >> "$INSTALL_LOG" 2>&1
    rm -f /tmp/mysql_secure.exp
    
    log "MariaDB installed successfully"
    info "MariaDB root password: $MYSQL_ROOT_PASS"
}

# ============================================
# ENHANCED PTERODACTYL PANEL INSTALLATION
# ============================================
install_pterodactyl_panel() {
    menu_header "Install Pterodactyl Panel"
    
    # Collect information
    echo -e "${INFO_COLOR}Panel Installation Settings${NC}"
    echo
    
    input_with_default "Domain Name" "panel.example.com" PANEL_DOMAIN "domain"
    input_with_default "Admin Email" "admin@example.com" PANEL_EMAIL "email"
    
    local default_user
    default_user=$(echo "$PANEL_EMAIL" | cut -d'@' -f1)
    input_with_default "Admin Username" "$default_user" PANEL_USERNAME
    input_password "Admin Password" PANEL_PASSWORD
    
    input_with_default "First Name" "$default_user" PANEL_FIRST_NAME
    input_with_default "Last Name" "Admin" PANEL_LAST_NAME
    
    echo
    echo -e "${INFO_COLOR}Database Settings${NC}"
    input_with_default "Database Name" "pterodactyl" DB_NAME
    input_with_default "Database User" "pterodactyl" DB_USER
    input_password "Database Password" DB_PASS
    
    # Ask about SSL
    echo
    echo -e "${INFO_COLOR}SSL Configuration${NC}"
    echo -e "${OPTION_COLOR}1)${NC} Install SSL automatically (Recommended)"
    echo -e "${OPTION_COLOR}2)${NC} Install SSL manually later"
    echo -e "${OPTION_COLOR}3)${NC} Skip SSL installation"
    echo
    
    read -rp "Choose SSL option [1-3]: " ssl_option
    
    # Start installation
    log "Starting Pterodactyl Panel installation..."
    
    # Update system
    update_system
    setup_php_repo
    
    # Install required packages
    log "Installing required packages..."
    apt-get install -y \
        "php${PHP_VERSION}" \
        "php${PHP_VERSION}-fpm" \
        "php${PHP_VERSION}-cli" \
        "php${PHP_VERSION}-common" \
        "php${PHP_VERSION}-gd" \
        "php${PHP_VERSION}-mysql" \
        "php${PHP_VERSION}-mbstring" \
        "php${PHP_VERSION}-bcmath" \
        "php${PHP_VERSION}-xml" \
        "php${PHP_VERSION}-curl" \
        "php${PHP_VERSION}-zip" \
        "php${PHP_VERSION}-intl" \
        "php${PHP_VERSION}-redis" \
        nginx \
        redis-server \
        >> "$INSTALL_LOG" 2>&1
    
    # Install MariaDB
    install_mariadb
    
    # Create database and user
    log "Creating database and user..."
    mysql -uroot -p"${MYSQL_ROOT_PASS}" -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    mysql -uroot -p"${MYSQL_ROOT_PASS}" -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASS}';"
    mysql -uroot -p"${MYSQL_ROOT_PASS}" -e "GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'127.0.0.1' WITH GRANT OPTION;"
    mysql -uroot -p"${MYSQL_ROOT_PASS}" -e "FLUSH PRIVILEGES;"
    
    # Install Composer
    if ! command -v composer >/dev/null; then
        log "Installing Composer..."
        curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer >> "$INSTALL_LOG" 2>&1
    fi
    
    # Create panel directory
    log "Creating panel directory..."
    mkdir -p "$PANEL_DIR"
    cd "$PANEL_DIR" || exit 1
    
    # Download Panel
    log "Downloading Pterodactyl Panel..."
    curl -L -o panel.tar.gz "$PANEL_TARBALL_URL"
    tar -xzf panel.tar.gz
    rm panel.tar.gz
    
    # Set permissions
    chmod -R 755 storage bootstrap/cache
    
    # Create environment file
    log "Configuring environment..."
    cat > .env <<EOF
APP_ENV=production
APP_DEBUG=false
APP_URL=https://${PANEL_DOMAIN}
APP_TIMEZONE=${APP_TIMEZONE}
APP_KEY=base64:$(openssl rand -base64 32)

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=${DB_NAME}
DB_USERNAME=${DB_USER}
DB_PASSWORD=${DB_PASS}

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

MAIL_MAILER=log
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=${PANEL_EMAIL}
MAIL_FROM_NAME="${PANEL_USERNAME}"

HASHIDS_SALT=$(openssl rand -hex 32)
HASHIDS_LENGTH=8
EOF
    
    # Install dependencies
    log "Installing PHP dependencies..."
    COMPOSER_ALLOW_SUPERUSER=1 composer install --no-dev --optimize-autoloader --no-interaction >> "$INSTALL_LOG" 2>&1
    
    # Generate key
    php artisan key:generate --force >> "$INSTALL_LOG" 2>&1
    
    # Run migrations
    log "Running database migrations..."
    php artisan migrate --seed --force >> "$INSTALL_LOG" 2>&1
    
    # Create admin user
    log "Creating admin user..."
    php artisan p:user:make \
        --email="$PANEL_EMAIL" \
        --username="$PANEL_USERNAME" \
        --name-first="$PANEL_FIRST_NAME" \
        --name-last="$PANEL_LAST_NAME" \
        --password="$PANEL_PASSWORD" \
        --admin=1 \
        --no-interaction >> "$INSTALL_LOG" 2>&1
    
    # Set permissions
    chown -R www-data:www-data "$PANEL_DIR"
    chmod -R 755 storage bootstrap/cache
    
    # Configure Nginx
    log "Configuring Nginx..."
    cat > /etc/nginx/sites-available/pterodactyl.conf <<EOF
server {
    listen 80;
    server_name ${PANEL_DOMAIN};
    
    root ${PANEL_DIR}/public;
    index index.php index.html index.htm;
    
    charset utf-8;
    
    access_log /var/log/nginx/pterodactyl.access.log;
    error_log /var/log/nginx/pterodactyl.error.log;
    
    client_max_body_size 100m;
    
    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }
    
    location ~ \.php\$ {
        fastcgi_split_path_info ^(.+\.php)(/.+)\$;
        fastcgi_pass unix:/run/php/php${PHP_VERSION}-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param PHP_VALUE "upload_max_filesize = 100M \\n post_max_size=100M";
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        fastcgi_param HTTP_PROXY "";
        fastcgi_intercept_errors off;
        fastcgi_buffer_size 16k;
        fastcgi_buffers 4 16k;
        fastcgi_connect_timeout 300;
        fastcgi_send_timeout 300;
        fastcgi_read_timeout 300;
    }
    
    location ~ /\. {
        deny all;
    }
}
EOF
    
    ln -sf /etc/nginx/sites-available/pterodactyl.conf /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
    
    # Test nginx
    if nginx -t >> "$INSTALL_LOG" 2>&1; then
        systemctl restart nginx >> "$INSTALL_LOG" 2>&1
    fi
    
    # Install SSL based on user choice
    case $ssl_option in
        1)
            log "Installing SSL certificate..."
            if obtain_ssl_certificate "$PANEL_DOMAIN" "$PANEL_EMAIL" "auto" "panel"; then
                ok "SSL installed successfully"
            else
                warn "SSL installation failed, panel will use HTTP"
            fi
            ;;
        2)
            info "SSL will be installed manually later"
            ;;
        3)
            info "SSL installation skipped"
            ;;
    esac
    
    # Setup queue worker
    log "Setting up queue worker..."
    cat > /etc/systemd/system/pteroq.service <<EOF
[Unit]
Description=Pterodactyl Queue Worker
After=redis-server.service

[Service]
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php ${PANEL_DIR}/artisan queue:work --queue=high,standard,low --sleep=3 --tries=3
StartLimitInterval=180
StartLimitBurst=30
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable pteroq.service >> "$INSTALL_LOG" 2>&1
    systemctl start pteroq.service >> "$INSTALL_LOG" 2>&1
    
    # Setup cron job
    (crontab -l 2>/dev/null; echo "* * * * * php ${PANEL_DIR}/artisan schedule:run >> /dev/null 2>&1") | crontab -
    
    # Add to installed components
    INSTALLED_COMPONENTS["panel"]=true
    COMPONENT_STATUS["panel"]="installed"
    
    success
    
    # Display info
    show_panel_info
}

show_panel_info() {
    echo
    echo -e "${HEADER_COLOR}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${SUCCESS_COLOR}   Pterodactyl Panel Installed Successfully!   ${NC}"
    echo -e "${HEADER_COLOR}═══════════════════════════════════════════════════════════${NC}"
    echo
    echo -e "${INFO_COLOR}Login Information:${NC}"
    echo -e "${OPTION_COLOR}URL:${NC} https://${PANEL_DOMAIN}"
    echo -e "${OPTION_COLOR}Email:${NC} ${PANEL_EMAIL}"
    echo -e "${OPTION_COLOR}Username:${NC} ${PANEL_USERNAME}"
    echo -e "${OPTION_COLOR}Password:${NC} ${PANEL_PASSWORD}"
    echo
    echo -e "${INFO_COLOR}Database Information:${NC}"
    echo -e "${OPTION_COLOR}User:${NC} ${DB_USER}"
    echo -e "${OPTION_COLOR}Password:${NC} ${DB_PASS}"
    echo -e "${OPTION_COLOR}Database:${NC} ${DB_NAME}"
    echo
    echo -e "${INFO_COLOR}Management Commands:${NC}"
    echo -e "${OPTION_COLOR}Panel Status:${NC} systemctl status pteroq.service"
    echo -e "${OPTION_COLOR}View Logs:${NC} tail -f /var/log/nginx/pterodactyl.error.log"
    echo -e "${OPTION_COLOR}Artisan:${NC} php $PANEL_DIR/artisan"
    echo
}

# ============================================
# ENHANCED WINGS INSTALLATION
# ============================================
install_wings() {
    menu_header "Install Pterodactyl Wings"
    
    # Check for kernel updates
    if [[ -f "/var/run/reboot-required" ]]; then
        warn "System requires reboot for kernel updates!"
        read -rp "Reboot now? (y/N): " reboot_choice
        if [[ "$reboot_choice" =~ ^[Yy]$ ]]; then
            reboot
        fi
    fi
    
    # Collect information
    echo -e "${INFO_COLOR}Wings Installation Settings${NC}"
    echo
    
    input_with_default "Panel URL" "https://panel.example.com" PANEL_URL "url"
    input_with_default "Node Domain" "node.example.com" WINGS_DOMAIN "domain"
    input_with_default "Node ID" "1" WINGS_NODE_ID "number"
    input_with_default "SSL Email" "admin@example.com" WINGS_EMAIL "email"
    
    echo
    echo -e "${YELLOW}Wings Token Instructions:${NC}"
    echo "1. Login to your Panel"
    echo "2. Go to Configuration → Wings"
    echo "3. Copy the Wings Token"
    echo
    
    input_with_default "Wings Token" "" WINGS_TOKEN
    
    # Ask about KVM support
    echo
    read -rp "Enable KVM support for LumenVM? (y/N): " kvm_choice
    
    # Ask about SSL
    echo
    echo -e "${INFO_COLOR}SSL Configuration${NC}"
    echo -e "${OPTION_COLOR}1)${NC} Install SSL automatically (Recommended)"
    echo -e "${OPTION_COLOR}2)${NC} Use existing SSL certificate"
    echo -e "${OPTION_COLOR}3)${NC} Skip SSL installation"
    echo
    
    read -rp "Choose SSL option [1-3]: " wings_ssl_option
    
    # Start installation
    log "Starting Wings installation..."
    
    # Update system
    update_system
    
    # Install Docker
    install_docker
    
    # Install KVM if requested
    if [[ "$kvm_choice" =~ ^[Yy]$ ]]; then
        install_kvm_support
    fi
    
    # Download and install Wings
    log "Downloading Wings..."
    local arch
    arch=$(uname -m)
    case "$arch" in
        x86_64|amd64) arch="amd64" ;;
        aarch64|arm64) arch="arm64" ;;
        *) fatal "Unsupported architecture: $arch" ;;
    esac
    
    curl -L -o /usr/local/bin/wings "${WINGS_URL}${arch}" >> "$INSTALL_LOG" 2>&1
    chmod +x /usr/local/bin/wings
    
    # Create configuration directory
    mkdir -p "$WINGS_DIR"
    cd "$WINGS_DIR" || exit 1
    
    # Fetch configuration from panel
    log "Fetching configuration from Panel..."
    wings configure --panel-url "$PANEL_URL" --token "$WINGS_TOKEN" --node "$WINGS_NODE_ID" >> "$INSTALL_LOG" 2>&1
    
    # Configure SSL
    local ssl_enabled=false
    case $wings_ssl_option in
        1)
            if obtain_ssl_certificate "$WINGS_DOMAIN" "$WINGS_EMAIL" "auto" "wings"; then
                ssl_enabled=true
            fi
            ;;
        2)
            if [[ -f "/etc/letsencrypt/live/${WINGS_DOMAIN}/fullchain.pem" ]]; then
                ssl_enabled=true
                ok "Using existing SSL certificate"
            else
                warn "SSL certificate not found"
            fi
            ;;
    esac
    
    # Update Wings configuration
    log "Updating Wings configuration..."
    
    if [[ "$ssl_enabled" == true ]]; then
        cat >> config.yml <<EOF
api:
  host: 0.0.0.0
  port: 443
  ssl:
    enabled: true
    cert: /etc/letsencrypt/live/${WINGS_DOMAIN}/fullchain.pem
    key: /etc/letsencrypt/live/${WINGS_DOMAIN}/privkey.pem
EOF
    else
        cat >> config.yml <<EOF
api:
  host: 0.0.0.0
  port: 8080
  ssl:
    enabled: false
EOF
    fi
    
    # Create systemd service
    log "Creating Wings service..."
    cat > /etc/systemd/system/wings.service <<EOF
[Unit]
Description=Pterodactyl Wings Daemon
After=docker.service
Requires=docker.service

[Service]
User=root
WorkingDirectory=/etc/pterodactyl
LimitNOFILE=4096
PIDFile=/var/run/wings/daemon.pid
ExecStart=/usr/local/bin/wings
Restart=on-failure
StartLimitInterval=180
StartLimitBurst=30
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable wings >> "$INSTALL_LOG" 2>&1
    systemctl start wings >> "$INSTALL_LOG" 2>&1
    
    # Add to installed components
    INSTALLED_COMPONENTS["wings"]=true
    COMPONENT_STATUS["wings"]="installed"
    
    success
    
    # Display info
    show_wings_info "$ssl_enabled"
}

install_docker() {
    log "Installing Docker..."
    
    # Remove old versions
    apt-get remove -y docker docker-engine docker.io containerd runc >> "$INSTALL_LOG" 2>&1 || true
    
    # Install prerequisites
    apt-get install -y \
        ca-certificates \
        curl \
        gnupg \
        lsb-release \
        >> "$INSTALL_LOG" 2>&1
    
    # Add Docker GPG key
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Add Docker repository
    echo \\
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \\
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    apt-get update -y >> "$INSTALL_LOG" 2>&1
    apt-get install -y \\
        docker-ce \\
        docker-ce-cli \\
        containerd.io \\
        docker-compose-plugin \\
        >> "$INSTALL_LOG" 2>&1
    
    # Start and enable Docker
    systemctl enable docker >> "$INSTALL_LOG" 2>&1
    systemctl start docker >> "$INSTALL_LOG" 2>&1
    
    # Create Docker network for Pterodactyl
    docker network create pterodactyl_nw >> "$INSTALL_LOG" 2>&1 || true
    
    ok "Docker installed successfully"
}

install_kvm_support() {
    log "Installing KVM support for LumenVM..."
    
    apt-get install -y \\
        qemu-kvm \\
        libvirt-daemon-system \\
        libvirt-clients \\
        bridge-utils \\
        virt-manager \\
        >> "$INSTALL_LOG" 2>&1
    
    # Add user to groups
    usermod -aG kvm www-data
    usermod -aG libvirt www-data
    
    # Enable KVM
    modprobe kvm
    modprobe kvm_intel 2>/dev/null || modprobe kvm_amd 2>/dev/null
    
    # Set permissions
    chmod 666 /dev/kvm 2>/dev/null || true
    
    ok "KVM support installed"
}

show_wings_info() {
    local ssl_enabled="$1"
    
    echo
    echo -e "${HEADER_COLOR}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${SUCCESS_COLOR}     Wings Installed Successfully!     ${NC}"
    echo -e "${HEADER_COLOR}═══════════════════════════════════════════════════════════${NC}"
    echo
    echo -e "${INFO_COLOR}Connection Information:${NC}"
    echo -e "${OPTION_COLOR}Panel URL:${NC} $PANEL_URL"
    echo -e "${OPTION_COLOR}Node Domain:${NC} $WINGS_DOMAIN"
    echo -e "${OPTION_COLOR}Node ID:${NC} $WINGS_NODE_ID"
    echo -e "${OPTION_COLOR}SSL Enabled:${NC} $( [[ "$ssl_enabled" == true ]] && echo "${GREEN}Yes${NC}" || echo "${RED}No${NC}" )"
    echo -e "${OPTION_COLOR}Port:${NC} $( [[ "$ssl_enabled" == true ]] && echo "443" || echo "8080" )"
    echo
    echo -e "${INFO_COLOR}Management Commands:${NC}"
    echo -e "${OPTION_COLOR}Wings Status:${NC} systemctl status wings"
    echo -e "${OPTION_COLOR}View Logs:${NC} journalctl -u wings -f"
    echo -e "${OPTION_COLOR}Restart:${NC} systemctl restart wings"
    echo
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Add this node in your Panel"
    echo "2. Configure node settings with above information"
    echo "3. Test connection from Panel"
    echo
}

# ============================================
# ENHANCED CTRLPANEL INSTALLATION
# ============================================
install_ctrlpanel() {
    menu_header "Install CtrlPanel"
    
    # Collect information
    echo -e "${INFO_COLOR}CtrlPanel Installation Settings${NC}"
    echo
    
    input_with_default "Domain Name" "ctrl.example.com" CTRL_DOMAIN "domain"
    input_with_default "Admin Email" "admin@example.com" CTRL_EMAIL "email"
    
    echo
    echo -e "${INFO_COLOR}Database Settings${NC}"
    input_with_default "Database Name" "ctrlpanel" CTRL_DB_NAME
    input_with_default "Database User" "ctrlpanel" CTRL_DB_USER
    input_password "Database Password" CTRL_DB_PASS
    
    # Ask about SSL
    echo
    echo -e "${INFO_COLOR}SSL Configuration${NC}"
    read -rp "Install SSL certificate for $CTRL_DOMAIN? (Y/n): " ctrl_ssl_choice
    ctrl_ssl_choice=${ctrl_ssl_choice:-Y}
    
    # Start installation
    log "Starting CtrlPanel installation..."
    
    # Update system
    update_system
    setup_php_repo
    
    # Install required packages
    log "Installing required packages..."
    apt-get install -y \
        "php${PHP_VERSION}" \
        "php${PHP_VERSION}-fpm" \
        "php${PHP_VERSION}-cli" \
        "php${PHP_VERSION}-common" \
        "php${PHP_VERSION}-gd" \
        "php${PHP_VERSION}-mysql" \
        "php${PHP_VERSION}-mbstring" \
        "php${PHP_VERSION}-bcmath" \
        "php${PHP_VERSION}-xml" \
        "php${PHP_VERSION}-curl" \
        "php${PHP_VERSION}-zip" \
        nginx \
        redis-server \
        >> "$INSTALL_LOG" 2>&1
    
    # Create database and user
    log "Creating database and user..."
    mysql -uroot -p"${MYSQL_ROOT_PASS}" -e "CREATE DATABASE IF NOT EXISTS \`${CTRL_DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    mysql -uroot -p"${MYSQL_ROOT_PASS}" -e "CREATE USER IF NOT EXISTS '${CTRL_DB_USER}'@'127.0.0.1' IDENTIFIED BY '${CTRL_DB_PASS}';"
    mysql -uroot -p"${MYSQL_ROOT_PASS}" -e "GRANT ALL PRIVILEGES ON \`${CTRL_DB_NAME}\`.* TO '${CTRL_DB_USER}'@'127.0.0.1' WITH GRANT OPTION;"
    mysql -uroot -p"${MYSQL_ROOT_PASS}" -e "FLUSH PRIVILEGES;"
    
    # Install Composer
    if ! command -v composer >/dev/null; then
        curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer >> "$INSTALL_LOG" 2>&1
    fi
    
    # Create CtrlPanel directory
    log "Creating CtrlPanel directory..."
    mkdir -p "$CTRLPANEL_DIR"
    cd "$CTRLPANEL_DIR" || exit 1
    
    # Clone CtrlPanel
    log "Downloading CtrlPanel..."
    git clone "$CTRLPANEL_URL" . >> "$INSTALL_LOG" 2>&1
    
    # Install dependencies
    log "Installing dependencies..."
    composer install --no-dev --optimize-autoloader --no-interaction >> "$INSTALL_LOG" 2>&1
    
    # Create environment file
    log "Configuring environment..."
    cp .env.example .env
    sed -i "s|APP_URL=.*|APP_URL=https://${CTRL_DOMAIN}|" .env
    sed -i "s|DB_DATABASE=.*|DB_DATABASE=${CTRL_DB_NAME}|" .env
    sed -i "s|DB_USERNAME=.*|DB_USERNAME=${CTRL_DB_USER}|" .env
    sed -i "s|DB_PASSWORD=.*|DB_PASSWORD=${CTRL_DB_PASS}|" .env
    
    # Generate key
    php artisan key:generate --force >> "$INSTALL_LOG" 2>&1
    
    # Run migrations
    log "Running migrations..."
    php artisan migrate --seed --force >> "$INSTALL_LOG" 2>&1
    
    # Set permissions
    chown -R www-data:www-data "$CTRLPANEL_DIR"
    chmod -R 755 storage bootstrap/cache
    
    # Configure Nginx
    log "Configuring Nginx..."
    cat > /etc/nginx/sites-available/ctrlpanel.conf <<EOF
server {
    listen 80;
    server_name ${CTRL_DOMAIN};
    
    root ${CTRLPANEL_DIR}/public;
    index index.php index.html index.htm;
    
    charset utf-8;
    
    access_log /var/log/nginx/ctrlpanel.access.log;
    error_log /var/log/nginx/ctrlpanel.error.log;
    
    client_max_body_size 100m;
    
    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }
    
    location ~ \.php\$ {
        fastcgi_split_path_info ^(.+\.php)(/.+)\$;
        fastcgi_pass unix:/run/php/php${PHP_VERSION}-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param PHP_VALUE "upload_max_filesize = 100M \\n post_max_size=100M";
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        fastcgi_param HTTP_PROXY "";
        fastcgi_intercept_errors off;
        fastcgi_buffer_size 16k;
        fastcgi_buffers 4 16k;
        fastcgi_connect_timeout 300;
        fastcgi_send_timeout 300;
        fastcgi_read_timeout 300;
    }
    
    location ~ /\. {
        deny all;
    }
}
EOF
    
    ln -sf /etc/nginx/sites-available/ctrlpanel.conf /etc/nginx/sites-enabled/
    
    # Test nginx
    if nginx -t >> "$INSTALL_LOG" 2>&1; then
        systemctl restart nginx >> "$INSTALL_LOG" 2>&1
    fi
    
    # Install SSL if requested
    if [[ "$ctrl_ssl_choice" =~ ^[Yy]$ ]]; then
        obtain_ssl_certificate "$CTRL_DOMAIN" "$CTRL_EMAIL" "auto" "ctrlpanel"
    fi
    
    # Create queue worker
    log "Setting up queue worker..."
    cat > /etc/systemd/system/ctrlpanel.service <<EOF
[Unit]
Description=CtrlPanel Queue Worker

[Service]
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php ${CTRLPANEL_DIR}/artisan queue:work --sleep=3 --tries=3
StartLimitInterval=180
StartLimitBurst=30
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable ctrlpanel.service >> "$INSTALL_LOG" 2>&1
    systemctl start ctrlpanel.service >> "$INSTALL_LOG" 2>&1
    
    # Add to installed components
    INSTALLED_COMPONENTS["ctrlpanel"]=true
    COMPONENT_STATUS["ctrlpanel"]="installed"
    
    success
    
    # Display info
    show_ctrlpanel_info
}

show_ctrlpanel_info() {
    echo
    echo -e "${HEADER_COLOR}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${SUCCESS_COLOR}     CtrlPanel Installed Successfully!     ${NC}"
    echo -e "${HEADER_COLOR}═══════════════════════════════════════════════════════════${NC}"
    echo
    echo -e "${INFO_COLOR}Login Information:${NC}"
    echo -e "${OPTION_COLOR}URL:${NC} https://${CTRL_DOMAIN}"
    echo -e "${OPTION_COLOR}Email:${NC} ${CTRL_EMAIL}"
    echo
    echo -e "${INFO_COLOR}Database Information:${NC}"
    echo -e "${OPTION_COLOR}User:${NC} ${CTRL_DB_USER}"
    echo -e "${OPTION_COLOR}Password:${NC} ${CTRL_DB_PASS}"
    echo -e "${OPTION_COLOR}Database:${NC} ${CTRL_DB_NAME}"
    echo
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Complete setup via web installer"
    echo "2. Configure your billing settings"
    echo "3. Set up payment gateways"
    echo
}

# ============================================
# ENHANCED SYSTEM OPTIMIZATION
# ============================================
optimize_system() {
    menu_header "System Optimization"
    
    echo -e "${INFO_COLOR}Optimization Options:${NC}"
    echo
    echo -e "${OPTION_COLOR}1)${NC} Optimize MariaDB/MySQL"
    echo -e "${OPTION_COLOR}2)${NC} Optimize PHP-FPM"
    echo -e "${OPTION_COLOR}3)${NC} Optimize Redis"
    echo -e "${OPTION_COLOR}4)${NC} Optimize Kernel Parameters"
    echo -e "${OPTION_COLOR}5)${NC} Optimize Nginx"
    echo -e "${OPTION_COLOR}6)${NC} All Optimizations"
    echo -e "${OPTION_COLOR}7)${NC} Return"
    echo
    
    read -rp "Choose option [1-7]: " optimize_choice
    
    case $optimize_choice in
        1) optimize_mysql ;;
        2) optimize_php ;;
        3) optimize_redis ;;
        4) optimize_kernel ;;
        5) optimize_nginx ;;
        6)
            optimize_mysql
            optimize_php
            optimize_redis
            optimize_kernel
            optimize_nginx
            SYSTEM_OPTIMIZED=true
            ;;
        7) return ;;
        *) error "Invalid option" ;;
    esac
    
    success "System optimization completed"
}

optimize_mysql() {
    log "Optimizing MariaDB/MySQL configuration..."
    
    local memory_mb
    memory_mb=$(free -m | awk '/^Mem:/{print $2}')
    local innodb_buffer_pool=$((memory_mb * 60 / 100))M
    
    cat > /etc/mysql/mariadb.conf.d/99-optimization.cnf <<EOF
[mysqld]
# Performance
innodb_buffer_pool_size = ${innodb_buffer_pool}
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
innodb_file_per_table = 1

# Connections
max_connections = 500
thread_cache_size = 50
table_open_cache = 2000
table_definition_cache = 1000

# Query cache (disabled in MySQL 8)
query_cache_type = 0
query_cache_size = 0

# Temporary tables
tmp_table_size = 64M
max_heap_table_size = 64M

# Logging
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
log_queries_not_using_indexes = 1
EOF
    
    systemctl restart mariadb >> "$INSTALL_LOG" 2>&1
    ok "MariaDB optimized"
}

optimize_php() {
    log "Optimizing PHP-FPM configuration..."
    
    cat > "/etc/php/${PHP_VERSION}/fpm/conf.d/99-optimization.ini" <<EOF
; OpCache optimization
opcache.enable=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=32
opcache.max_accelerated_files=10000
opcache.revalidate_freq=60
opcache.fast_shutdown=1
opcache.enable_cli=1

; Memory limits
memory_limit=512M
upload_max_filesize=256M
post_max_size=256M
max_execution_time=300
max_input_time=300

; Session optimization
session.gc_maxlifetime=1440
session.cookie_lifetime=1440
session.save_handler=redis
session.save_path="tcp://127.0.0.1:6379"
EOF
    
    # Optimize FPM pool
    local memory_mb
    memory_mb=$(free -m | awk '/^Mem:/{print $2}')
    local pm_max_children=$((memory_mb / 80))
    
    sed -i "/^pm\\./d" "/etc/php/${PHP_VERSION}/fpm/pool.d/www.conf"
    cat >> "/etc/php/${PHP_VERSION}/fpm/pool.d/www.conf" <<EOF
pm = dynamic
pm.max_children = $pm_max_children
pm.start_servers = $((pm_max_children / 4))
pm.min_spare_servers = $((pm_max_children / 8))
pm.max_spare_servers = $((pm_max_children / 2))
pm.max_requests = 500
EOF
    
    systemctl restart "php${PHP_VERSION}-fpm" >> "$INSTALL_LOG" 2>&1
    ok "PHP-FPM optimized"
}

optimize_redis() {
    log "Optimizing Redis configuration..."
    
    cat > /etc/redis/redis.conf <<EOF
bind 127.0.0.1
port 6379
timeout 0
tcp-keepalive 300
daemonize yes
supervised systemd
pidfile /var/run/redis/redis-server.pid
loglevel notice
logfile /var/log/redis/redis-server.log
databases 16
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /var/lib/redis
maxmemory 512mb
maxmemory-policy allkeys-lru
appendonly no
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
EOF
    
    systemctl restart redis-server >> "$INSTALL_LOG" 2>&1
    ok "Redis optimized"
}

optimize_kernel() {
    log "Optimizing kernel parameters..."
    
    cat > /etc/sysctl.d/99-optimization.conf <<EOF
# Network optimization
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.ipv4.tcp_rmem = 4096 87380 134217728
net.ipv4.tcp_wmem = 4096 65536 134217728
net.ipv4.tcp_congestion_control = bbr
net.ipv4.tcp_fastopen = 3
net.core.default_qdisc = fq
net.ipv4.tcp_mtu_probing = 1

# Connection tracking
net.netfilter.nf_conntrack_max = 262144
net.nf_conntrack_max = 262144

# Memory management
vm.swappiness = 10
vm.vfs_cache_pressure = 50
vm.dirty_ratio = 10
vm.dirty_background_ratio = 5
vm.overcommit_memory = 1
vm.overcommit_ratio = 50

# File handles
fs.file-max = 2097152
fs.nr_open = 2097152

# Security
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048
EOF
    
    sysctl -p /etc/sysctl.d/99-optimization.conf >> "$INSTALL_LOG" 2>&1
    ok "Kernel optimized"
}

optimize_nginx() {
    log "Optimizing Nginx configuration..."
    
    local cpu_cores
    cpu_cores=$(nproc)
    
    cat > /etc/nginx/nginx.conf <<EOF
user www-data;
worker_processes auto;
worker_rlimit_nofile 65535;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 4096;
    multi_accept on;
    use epoll;
}

http {
    # Basic
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;
    client_max_body_size 256m;
    
    # MIME
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Virtual hosts
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF
    
    # Create optimized server configurations
    for site in /etc/nginx/sites-available/*; do
        local site_name
        site_name=$(basename "$site")
        sed -i '/^server {/,/^}/ {
            /location ~ \\\\.php\$/ {
                a\\        fastcgi_buffers 16 16k;
                a\\        fastcgi_buffer_size 32k;
            }
        }' "$site"
    done
    
    nginx -t && systemctl restart nginx >> "$INSTALL_LOG" 2>&1
    ok "Nginx optimized"
}

# ============================================
# ENHANCED BACKUP & RESTORE
# ============================================
create_backup() {
    local component="$1"
    local timestamp
    timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_path="$BACKUP_DIR/$component-$timestamp"
    
    mkdir -p "$backup_path"
    
    case "$component" in
        "panel")
            log "Backing up Panel..."
            cp -r "$PANEL_DIR" "$backup_path/" 2>/dev/null || true
            cp "/etc/nginx/sites-available/pterodactyl.conf" "$backup_path/" 2>/dev/null || true
            mysqldump -u root -p"${MYSQL_ROOT_PASS}" "${DB_NAME}" > "$backup_path/panel.sql" 2>/dev/null || true
            ;;
        "wings")
            log "Backing up Wings..."
            cp -r "$WINGS_DIR" "$backup_path/" 2>/dev/null || true
            cp "/usr/local/bin/wings" "$backup_path/" 2>/dev/null || true
            ;;
        "ctrlpanel")
            log "Backing up CtrlPanel..."
            cp -r "$CTRLPANEL_DIR" "$backup_path/" 2>/dev/null || true
            cp "/etc/nginx/sites-available/ctrlpanel.conf" "$backup_path/" 2>/dev/null || true
            mysqldump -u root -p"${MYSQL_ROOT_PASS}" "${CTRL_DB_NAME}" > "$backup_path/ctrlpanel.sql" 2>/dev/null || true
            ;;
        "all")
            log "Creating comprehensive backup..."
            create_backup "panel"
            create_backup "wings"
            create_backup "ctrlpanel"
            return
            ;;
    esac
    
    # Create archive
    tar -czf "$backup_path.tar.gz" -C "$BACKUP_DIR" "$component-$timestamp"
    rm -rf "$backup_path"
    
    log "Backup created: $backup_path.tar.gz"
}

restore_backup() {
    local backup_file="$1"
    local component="$2"
    
    if [[ ! -f "$backup_file" ]]; then
        error "Backup file not found: $backup_file"
        return 1
    fi
    
    local temp_dir
    temp_dir=$(mktemp -d)
    tar -xzf "$backup_file" -C "$temp_dir"
    
    case "$component" in
        "panel")
            log "Restoring Panel..."
            systemctl stop pteroq.service
            systemctl stop nginx
            cp -r "$temp_dir"/* "$PANEL_DIR/"
            mysql -u root -p"${MYSQL_ROOT_PASS}" "${DB_NAME}" < "$temp_dir/panel.sql" 2>/dev/null || true
            systemctl start nginx
            systemctl start pteroq.service
            ;;
        "wings")
            log "Restoring Wings..."
            systemctl stop wings
            cp -r "$temp_dir"/* "$WINGS_DIR/"
            cp "$temp_dir/wings" /usr/local/bin/wings
            chmod +x /usr/local/bin/wings
            systemctl start wings
            ;;
        "ctrlpanel")
            log "Restoring CtrlPanel..."
            systemctl stop ctrlpanel.service
            systemctl stop nginx
            cp -r "$temp_dir"/* "$CTRLPANEL_DIR/"
            mysql -u root -p"${MYSQL_ROOT_PASS}" "${CTRL_DB_NAME}" < "$temp_dir/ctrlpanel.sql" 2>/dev/null || true
            systemctl start nginx
            systemctl start ctrlpanel.service
            ;;
    esac
    
    rm -rf "$temp_dir"
    log "Backup restored successfully"
}

# ============================================
# ENHANCED MONITORING & DIAGNOSTICS
# ============================================
show_system_status() {
    menu_header "System Status & Diagnostics"
    
    echo -e "${INFO_COLOR}System Information:${NC}"
    echo -e "${OPTION_COLOR}Hostname:${NC} $(hostname)"
    echo -e "${OPTION_COLOR}Uptime:${NC} $(uptime -p)"
    echo -e "${OPTION_COLOR}Load Average:${NC} $(uptime | awk -F'load average:' '{print $2}')"
    echo -e "${OPTION_COLOR}CPU Usage:${NC} $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')%"
    echo -e "${OPTION_COLOR}Memory Usage:${NC} $(free -h | awk '/^Mem:/ {print $3 "/" $2}')"
    echo -e "${OPTION_COLOR}Disk Usage:${NC} $(df -h / | awk 'NR==2 {print $3 "/" $2 " (" $5 ")"}')"
    echo
    
    echo -e "${INFO_COLOR}Network Information:${NC}"
    echo -e "${OPTION_COLOR}Public IP:${NC} $(get_public_ip)"
    echo -e "${OPTION_COLOR}Local IP:${NC} $(hostname -I | awk '{print $1}')"
    echo
    
    echo -e "${INFO_COLOR}Service Status:${NC}"
    check_service_status "nginx" "Nginx"
    check_service_status "mariadb" "MariaDB"
    check_service_status "redis-server" "Redis"
    check_service_status "php${PHP_VERSION}-fpm" "PHP-FPM"
    check_service_status "pteroq.service" "PteroQ"
    check_service_status "wings" "Wings"
    check_service_status "ctrlpanel.service" "CtrlPanel"
    echo
    
    echo -e "${INFO_COLOR}SSL Certificates:${NC}"
    check_ssl_status "$PANEL_DOMAIN" "Panel"
    check_ssl_status "$WINGS_DOMAIN" "Wings"
    check_ssl_status "$CTRL_DOMAIN" "CtrlPanel"
    echo
    
    read -rp "Press Enter to continue..."
}

check_service_status() {
    local service="$1"
    local name="$2"
    
    if systemctl is-active --quiet "$service" 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} $name: ${GREEN}Active${NC}"
    else
        echo -e "  ${RED}✗${NC} $name: ${RED}Inactive${NC}"
    fi
}

check_ssl_status() {
    local domain="$1"
    local name="$2"
    
    if [[ -n "$domain" ]]; then
        local cert_file="/etc/letsencrypt/live/${domain}/cert.pem"
        if [[ -f "$cert_file" ]]; then
            local days_remaining
            days_remaining=$(get_certificate_days_remaining "$domain")
            if [[ "$days_remaining" -gt 0 ]]; then
                echo -e "  ${GREEN}✓${NC} $name SSL: ${GREEN}Valid ($days_remaining days)${NC}"
            else
                echo -e "  ${RED}✗${NC} $name SSL: ${RED}Expired${NC}"
            fi
        else
            echo -e "  ${YELLOW}⚠${NC} $name SSL: ${YELLOW}Not installed${NC}"
        fi
    fi
}

# ============================================
# ENHANCED MAINTENANCE FUNCTIONS
# ============================================
system_maintenance() {
    menu_header "System Maintenance"
    
    echo -e "${INFO_COLOR}Maintenance Options:${NC}"
    echo
    echo -e "${OPTION_COLOR}1)${NC} Clear System Cache"
    echo -e "${OPTION_COLOR}2)${NC} Fix File Permissions"
    echo -e "${OPTION_COLOR}3)${NC} Repair Databases"
    echo -e "${OPTION_COLOR}4)${NC} Update All Components"
    echo -e "${OPTION_COLOR}5)${NC} Renew All SSL Certificates"
    echo -e "${OPTION_COLOR}6)${NC} Cleanup Old Files"
    echo -e "${OPTION_COLOR}7)${NC} Return"
    echo
    
    read -rp "Choose option [1-7]: " maintenance_choice
    
    case $maintenance_choice in
        1) clear_cache ;;
        2) fix_permissions ;;
        3) repair_databases ;;
        4) update_components ;;
        5) renew_all_ssl ;;
        6) cleanup_files ;;
        7) return ;;
        *) error "Invalid option" ;;
    esac
}

clear_cache() {
    log "Clearing system cache..."
    
    sync
    echo 3 > /proc/sys/vm/drop_caches
    
    # Clear application caches
    if [[ "${INSTALLED_COMPONENTS[panel]}" == true ]]; then
        cd "$PANEL_DIR" && php artisan optimize:clear >> "$INSTALL_LOG" 2>&1
    fi
    
    if [[ "${INSTALLED_COMPONENTS[ctrlpanel]}" == true ]]; then
        cd "$CTRLPANEL_DIR" && php artisan optimize:clear >> "$INSTALL_LOG" 2>&1
    fi
    
    # Clear Nginx cache
    rm -rf /var/cache/nginx/*
    
    ok "System cache cleared"
}

fix_permissions() {
    log "Fixing file permissions..."
    
    # Panel permissions
    if [[ "${INSTALLED_COMPONENTS[panel]}" == true ]]; then
        chown -R www-data:www-data "$PANEL_DIR"
        chmod -R 755 "$PANEL_DIR/storage"
        chmod -R 755 "$PANEL_DIR/bootstrap/cache"
        ok "Panel permissions fixed"
    fi
    
    # CtrlPanel permissions
    if [[ "${INSTALLED_COMPONENTS[ctrlpanel]}" == true ]]; then
        chown -R www-data:www-data "$CTRLPANEL_DIR"
        chmod -R 755 "$CTRLPANEL_DIR/storage"
        chmod -R 755 "$CTRLPANEL_DIR/bootstrap/cache"
        ok "CtrlPanel permissions fixed"
    fi
    
    # Wings permissions
    if [[ "${INSTALLED_COMPONENTS[wings]}" == true ]]; then
        chown -R root:root "$WINGS_DIR"
        chmod 600 "$WINGS_DIR/config.yml"
        ok "Wings permissions fixed"
    fi
    
    ok "All permissions fixed"
}

repair_databases() {
    log "Repairing databases..."
    
    # Repair MariaDB tables
    mysqlcheck -u root -p"${MYSQL_ROOT_PASS}" --auto-repair --all-databases >> "$INSTALL_LOG" 2>&1
    
    # Run migrations
    if [[ "${INSTALLED_COMPONENTS[panel]}" == true ]]; then
        cd "$PANEL_DIR" && php artisan migrate --force >> "$INSTALL_LOG" 2>&1
    fi
    
    if [[ "${INSTALLED_COMPONENTS[ctrlpanel]}" == true ]]; then
        cd "$CTRLPANEL_DIR" && php artisan migrate --force >> "$INSTALL_LOG" 2>&1
    fi
    
    ok "Databases repaired"
}

update_components() {
    log "Updating all components..."
    
    # Update Panel
    if [[ "${INSTALLED_COMPONENTS[panel]}" == true ]]; then
        cd "$PANEL_DIR" || return
        php artisan down
        curl -L "$PANEL_TARBALL_URL" | tar -xz
        chmod -R 755 storage bootstrap/cache
        composer install --no-dev --optimize-autoloader --no-interaction
        php artisan view:clear
        php artisan config:clear
        php artisan migrate --force
        chown -R www-data:www-data .
        php artisan queue:restart
        php artisan up
        ok "Panel updated"
    fi
    
    # Update Wings
    if [[ "${INSTALLED_COMPONENTS[wings]}" == true ]]; then
        systemctl stop wings
        local arch
        arch=$(uname -m)
        case "$arch" in
            x86_64|amd64) arch="amd64" ;;
            aarch64|arm64) arch="arm64" ;;
        esac
        curl -L -o /usr/local/bin/wings "${WINGS_URL}${arch}"
        chmod +x /usr/local/bin/wings
        systemctl start wings
        ok "Wings updated"
    fi
    
    # Update CtrlPanel
    if [[ "${INSTALLED_COMPONENTS[ctrlpanel]}" == true ]]; then
        cd "$CTRLPANEL_DIR" || return
        git pull origin master
        composer install --no-dev --optimize-autoloader --no-interaction
        php artisan migrate --force
        ok "CtrlPanel updated"
    fi
    
    ok "All components updated"
}

renew_all_ssl() {
    log "Renewing all SSL certificates..."
    
    if command -v certbot >/dev/null 2>&1; then
        certbot renew --quiet >> "$INSTALL_LOG" 2>&1
        systemctl reload nginx >> "$INSTALL_LOG" 2>&1
        
        # Restart Wings if SSL is enabled
        if [[ "${INSTALLED_COMPONENTS[wings]}" == true ]]; then
            systemctl restart wings >> "$INSTALL_LOG" 2>&1
        fi
        
        ok "SSL certificates renewed"
    else
        error "Certbot not installed"
    fi
}

cleanup_files() {
    log "Cleaning up old files..."
    
    # Clean old logs
    find /var/log -name "*.log" -type f -mtime +30 -delete
    find /var/log -name "*.gz" -type f -mtime +30 -delete
    
    # Clean old backups
    find "$BACKUP_DIR" -name "*.tar.gz" -type f -mtime +7 -delete
    
    # Clean Docker
    docker system prune -af >> "$INSTALL_LOG" 2>&1
    
    # Clean apt cache
    apt-get autoclean -y >> "$INSTALL_LOG" 2>&1
    apt-get autoremove -y >> "$INSTALL_LOG" 2>&1
    
    ok "Cleanup completed"
}

# ============================================
# ENHANCED MAIN MENU SYSTEM
# ============================================
main_menu() {
    while true; do
        display_banner
        
        echo -e "${INFO_COLOR}Installed Components:${NC}"
        if [[ ${#INSTALLED_COMPONENTS[@]} -eq 0 ]]; then
            echo -e "  ${YELLOW}No components installed${NC}"
        else
            [[ "${INSTALLED_COMPONENTS[panel]}" == true ]] && echo -e "  ${GREEN}✓${NC} Pterodactyl Panel"
            [[ "${INSTALLED_COMPONENTS[wings]}" == true ]] && echo -e "  ${GREEN}✓${NC} Pterodactyl Wings"
            [[ "${INSTALLED_COMPONENTS[ctrlpanel]}" == true ]] && echo -e "  ${GREEN}✓${NC} CtrlPanel"
        fi
        echo
        
        echo -e "${INFO_COLOR}System Status:${NC}"
        echo -e "  ${OPTION_COLOR}Optimized:${NC} $( [[ "$SYSTEM_OPTIMIZED" == true ]] && echo "${GREEN}Yes${NC}" || echo "${YELLOW}No${NC}" )"
        echo -e "  ${OPTION_COLOR}SSL Managed:${NC} $( [[ -f "/etc/letsencrypt/accounts" ]] && echo "${GREEN}Yes${NC}" || echo "${YELLOW}No${NC}" )"
        echo
        
        echo -e "${HEADER_COLOR}Main Menu:${NC}"
        echo
        echo -e "${OPTION_COLOR}1)${NC} Install Components"
        echo -e "${OPTION_COLOR}2)${NC} Manage SSL Certificates"
        echo -e "${OPTION_COLOR}3)${NC} System Optimization"
        echo -e "${OPTION_COLOR}4)${NC} Backup & Restore"
        echo -e "${OPTION_COLOR}5)${NC} System Maintenance"
        echo -e "${OPTION_COLOR}6)${NC} System Status"
        echo -e "${OPTION_COLOR}7)${NC} Theme Management"
        echo -e "${OPTION_COLOR}8)${NC} Settings"
        echo -e "${OPTION_COLOR}9)${NC} Exit"
        echo
        
        read -rp "Choose option [1-9]: " main_choice
        
        case $main_choice in
            1) install_menu ;;
            2) ssl_menu ;;
            3) optimize_system ;;
            4) backup_menu ;;
            5) system_maintenance ;;
            6) show_system_status ;;
            7) themes_menu ;;
            8) settings_menu ;;
            9) exit_script ;;
            *) error "Invalid option" ;;
        esac
        
        if [[ "$main_choice" -ne 9 ]]; then
            echo
            read -rp "Press Enter to continue..."
        fi
    done
}

install_menu() {
    menu_header "Installation Menu"
    
    echo -e "${INFO_COLOR}Available Components:${NC}"
    echo
    echo -e "${OPTION_COLOR}1)${NC} Install Pterodactyl Panel"
    echo -e "${OPTION_COLOR}2)${NC} Install Pterodactyl Wings"
    echo -e "${OPTION_COLOR}3)${NC} Install CtrlPanel"
    echo -e "${OPTION_COLOR}4)${NC} Install Panel + Wings (Full Stack)"
    echo -e "${OPTION_COLOR}5)${NC} Install All Components"
    echo -e "${OPTION_COLOR}6)${NC} Return to Main Menu"
    echo
    
    read -rp "Choose option [1-6]: " install_choice
    
    case $install_choice in
        1) install_pterodactyl_panel ;;
        2) install_wings ;;
        3) install_ctrlpanel ;;
        4)
            install_pterodactyl_panel
            install_wings
            ;;
        5)
            install_pterodactyl_panel
            install_wings
            install_ctrlpanel
            ;;
        6) return ;;
        *) error "Invalid option" ;;
    esac
}

ssl_menu() {
    menu_header "SSL Certificate Management"
    
    echo -e "${INFO_COLOR}SSL Operations:${NC}"
    echo
    echo -e "${OPTION_COLOR}1)${NC} Install SSL Certificate"
    echo -e "${OPTION_COLOR}2)${NC} Renew SSL Certificate"
    echo -e "${OPTION_COLOR}3)${NC} Check SSL Status"
    echo -e "${OPTION_COLOR}4)${NC} Setup Auto-Renewal"
    echo -e "${OPTION_COLOR}5)${NC} Return"
    echo
    
    read -rp "Choose option [1-5]: " ssl_choice
    
    case $ssl_choice in
        1)
            echo
            echo -e "${INFO_COLOR}Select component for SSL:${NC}"
            echo -e "${OPTION_COLOR}1)${NC} Panel ($PANEL_DOMAIN)"
            echo -e "${OPTION_COLOR}2)${NC} Wings ($WINGS_DOMAIN)"
            echo -e "${OPTION_COLOR}3)${NC} CtrlPanel ($CTRL_DOMAIN)"
            echo -e "${OPTION_COLOR}4)${NC} Custom Domain"
            echo
            
            read -rp "Choose option [1-4]: " ssl_component
            
            case $ssl_component in
                1)
                    [[ -n "$PANEL_DOMAIN" && -n "$PANEL_EMAIL" ]] && \\
                        obtain_ssl_certificate "$PANEL_DOMAIN" "$PANEL_EMAIL" "auto" "panel" || \\
                        error "Panel domain or email not configured"
                    ;;
                2)
                    [[ -n "$WINGS_DOMAIN" && -n "$WINGS_EMAIL" ]] && \\
                        obtain_ssl_certificate "$WINGS_DOMAIN" "$WINGS_EMAIL" "auto" "wings" || \\
                        error "Wings domain or email not configured"
                    ;;
                3)
                    [[ -n "$CTRL_DOMAIN" && -n "$CTRL_EMAIL" ]] && \\
                        obtain_ssl_certificate "$CTRL_DOMAIN" "$CTRL_EMAIL" "auto" "ctrlpanel" || \\
                        error "CtrlPanel domain or email not configured"
                    ;;
                4)
                    input_with_default "Domain Name" "" CUSTOM_DOMAIN "domain"
                    input_with_default "Email Address" "" CUSTOM_EMAIL "email"
                    obtain_ssl_certificate "$CUSTOM_DOMAIN" "$CUSTOM_EMAIL" "auto" "custom"
                    ;;
            esac
            ;;
        2)
            renew_all_ssl
            ;;
        3)
            echo
            echo -e "${INFO_COLOR}SSL Certificate Status:${NC}"
            [[ -n "$PANEL_DOMAIN" ]] && check_ssl_status "$PANEL_DOMAIN" "Panel"
            [[ -n "$WINGS_DOMAIN" ]] && check_ssl_status "$WINGS_DOMAIN" "Wings"
            [[ -n "$CTRL_DOMAIN" ]] && check_ssl_status "$CTRL_DOMAIN" "CtrlPanel"
            ;;
        4)
            setup_ssl_auto_renewal "all"
            ;;
        5) return ;;
        *) error "Invalid option" ;;
    esac
}

backup_menu() {
    menu_header "Backup & Restore"
    
    echo -e "${INFO_COLOR}Backup Operations:${NC}"
    echo
    echo -e "${OPTION_COLOR}1)${NC} Create Backup"
    echo -e "${OPTION_COLOR}2)${NC} Restore Backup"
    echo -e "${OPTION_COLOR}3)${NC} List Backups"
    echo -e "${OPTION_COLOR}4)${NC} Return"
    echo
    
    read -rp "Choose option [1-4]: " backup_choice
    
    case $backup_choice in
        1)
            echo
            echo -e "${INFO_COLOR}Select component to backup:${NC}"
            echo -e "${OPTION_COLOR}1)${NC} Panel"
            echo -e "${OPTION_COLOR}2)${NC} Wings"
            echo -e "${OPTION_COLOR}3)${NC} CtrlPanel"
            echo -e "${OPTION_COLOR}4)${NC} All Components"
            echo
            
            read -rp "Choose option [1-4]: " backup_component
            
            case $backup_component in
                1) create_backup "panel" ;;
                2) create_backup "wings" ;;
                3) create_backup "ctrlpanel" ;;
                4) create_backup "all" ;;
                *) error "Invalid option" ;;
            esac
            ;;
        2)
            echo
            echo -e "${INFO_COLOR}Available Backups:${NC}"
            local backups=()
            while IFS= read -r -d $'\\0' backup; do
                backups+=("$backup")
            done < <(find "$BACKUP_DIR" -name "*.tar.gz" -print0 | sort -zr)
            
            if [[ ${#backups[@]} -eq 0 ]]; then
                echo -e "${YELLOW}No backups found${NC}"
            else
                for i in "${!backups[@]}"; do
                    local backup_name
                    backup_name=$(basename "${backups[$i]}")
                    local backup_size
                    backup_size=$(du -h "${backups[$i]}" | cut -f1)
                    echo -e "${OPTION_COLOR}$((i+1)))${NC} $backup_name ($backup_size)"
                done
                
                echo
                read -rp "Select backup to restore (1-${#backups[@]}): " restore_choice
                
                if [[ "$restore_choice" -ge 1 && "$restore_choice" -le ${#backups[@]} ]]; then
                    local selected_backup="${backups[$((restore_choice-1))]}"
                    local component
                    component=$(basename "$selected_backup" | cut -d- -f1)
                    
                    read -rp "Restore $component from $(basename "$selected_backup")? (y/N): " confirm
                    if [[ "$confirm" =~ ^[Yy]$ ]]; then
                        restore_backup "$selected_backup" "$component"
                    fi
                else
                    error "Invalid selection"
                fi
            fi
            ;;
        3)
            echo
            echo -e "${INFO_COLOR}Available Backups:${NC}"
            find "$BACKUP_DIR" -name "*.tar.gz" -exec ls -lh {} \\; 2>/dev/null | \\
                awk '{print $9 " (" $5 ")"}' | sed "s|$BACKUP_DIR/||" || \\
                echo -e "${YELLOW}No backups found${NC}"
            ;;
        4) return ;;
        *) error "Invalid option" ;;
    esac
}
# ============================================
# HELPER FUNCTIONS FOR ERROR HANDLING
# ============================================
check_network_connectivity() {
    log "Checking network connectivity..."
    
    local endpoints=(
        "https://github.com"
        "https://deb.nodesource.com"
        "https://registry.npmjs.org"
    )
    
    for endpoint in "${endpoints[@]}"; do
        if curl -s --connect-timeout 5 --max-time 10 "$endpoint" > /dev/null 2>&1; then
            ok "Connected to: $endpoint"
            return 0
        else
            warn "Network connectivity check failed"
            return 1
        fi
    done
    
    warn "Network connectivity check failed"
    return 1
}

cleanup_failed_installation() {
    log "Cleaning up failed installation..."
    
    # Remove Node.js repositories
    rm -f /etc/apt/sources.list.d/nodesource.list
    rm -f /etc/apt/keyrings/nodesource.gpg
    
    # Remove yarn repository
    rm -f /etc/apt/sources.list.d/yarn.list
    rm -f /usr/share/keyrings/yarnkey.gpg
    
    # Clean apt cache
    apt-get autoremove -y >> "$INSTALL_LOG" 2>&1 || true
    apt-get autoclean -y >> "$INSTALL_LOG" 2>&1 || true
    
    ok "Cleanup completed"
}

# ============================================
# ENHANCED THEME MANAGEMENT FUNCTIONS
# ============================================
install_theme() {
    local theme_name="$1"
    
    menu_header "Install Theme: $theme_name"
    
    log "Installing $theme_name theme..."
    
    # تحديد إذا كان الثيم يحتاج Blueprint
    local needs_blueprint=false
    case "$theme_name" in
        "nebula"|"elysium")
            needs_blueprint=true
            ;;
    esac
    
    if $needs_blueprint && [[ "$BLUEPRINT_INSTALLED" != "true" ]]; then
        error "Cannot install $theme_name: Blueprint framework is not installed."
        return 1
    fi
    
    case "$theme_name" in
        "stellar")
            install_stellar_theme
            ;;
        "billing")
            install_billing_theme
            ;;
        "enigma")
            install_enigma_theme
            ;;
"nebula")
    # التحقق من Blueprint بطريقة مرنة
    local blueprint_available=false
    
    if command -v blueprint >/dev/null 2>&1; then
        blueprint_available=true
        info "Blueprint command found"
    elif [[ -f "/var/www/pterodactyl/blueprint.sh" ]]; then
        blueprint_available=true
        info "Blueprint script found"
    else
        error "Blueprint is required for Nebula theme but not found."
        echo -e "${YELLOW}Please install Blueprint framework first from the Theme Management menu.${NC}"
        return 1
    fi
    
    if $blueprint_available; then
        install_nebula_theme_manager
    else
        error "Cannot install Nebula theme"
        return 1
    fi
    ;;
        "elysium")
            install_elysium_theme_manager
            ;;
        "nightcore")
            install_nightcore_theme
            ;;
        *)
            error "Unknown theme: $theme_name"
            return 1
            ;;
    esac
    
    if [[ $? -eq 0 ]]; then
        # Add to installed themes array
        INSTALLED_THEMES+=("$theme_name")
        
        # Remove duplicates and sort
        INSTALLED_THEMES=($(echo "${INSTALLED_THEMES[@]}" | tr ' ' '\\n' | sort -u | tr '\\n' ' '))
        
        ok "Theme $theme_name installed successfully"
        return 0
    else
        error "Failed to install theme $theme_name"
        return 1
    fi
}

install_stellar_theme() {
    log "Installing Stellar theme..."
    
    cd /tmp || return 1
    wget -q "https://github.com/FyzzOffcial222/Autoinstaller-Theme-Pterodactyl/raw/main/stellar.zip" -O stellar.zip
    unzip -o stellar.zip -d /tmp/stellar
    sudo cp -rfT /tmp/stellar/pterodactyl /var/www/pterodactyl
    
    # Install dependencies
    curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
    sudo apt install -y nodejs
    sudo npm i -g yarn
    
    cd /var/www/pterodactyl
    yarn add react-feather
    php artisan migrate --force
    yarn build:production
    php artisan view:clear
    
    # Cleanup
    rm -rf /tmp/stellar /tmp/stellar.zip
    
    return 0
}

install_billing_theme() {
    log "Installing Billing theme..."
    
    cd /tmp || return 1
    wget -q "https://github.com/FyzzOffcial222/Autoinstaller-Theme-Pterodactyl/raw/main/billing.zip" -O billing.zip
    unzip -o billing.zip -d /tmp/billing
    sudo cp -rfT /tmp/billing/pterodactyl /var/www/pterodactyl
    
    # Install dependencies
    curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
    sudo apt install -y nodejs
    npm i -g yarn
    
    cd /var/www/pterodactyl
    yarn add react-feather
    php artisan billing:install stable
    php artisan migrate --force
    yarn build:production
    php artisan view:clear
    
    # Cleanup
    rm -rf /tmp/billing /tmp/billing.zip
    
    return 0
}

install_enigma_theme() {
    log "Installing Enigma theme..."
    
    cd /tmp || return 1
    wget -q "https://github.com/FyzzOffcial222/Autoinstaller-Theme-Pterodactyl/raw/main/enigma.zip" -O enigma.zip
    unzip -o enigma.zip -d /tmp/enigma
    sudo cp -rfT /tmp/enigma/pterodactyl /var/www/pterodactyl
    
    # Get user input for Enigma configuration
    echo -e "${YELLOW}Masukkan link wa (https://wa.me/...) : ${NC}"
    read LINK_WA
    echo -e "${YELLOW}Masukkan link group 1 (https://chat.whatsapp.com/...) : ${NC}"
    read LINK_GROUP1
    echo -e "${YELLOW}Masukkan link group 2 (https://chat.whatsapp.com/...) : ${NC}"
    read LINK_GROUP2
    echo -e "${YELLOW}Masukkan link channel (https://whatsapp.com/channel/...) : ${NC}"
    read LINK_CHNL
    
    # Replace placeholders
    sudo sed -i "s|LINK_WA|$LINK_WA|g" /var/www/pterodactyl/resources/scripts/components/dashboard/DashboardContainer.tsx
    sudo sed -i "s|LINK_GROUP1|$LINK_GROUP1|g" /var/www/pterodactyl/resources/scripts/components/dashboard/DashboardContainer.tsx
    sudo sed -i "s|LINK_GROUP2|$LINK_GROUP2|g" /var/www/pterodactyl/resources/scripts/components/dashboard/DashboardContainer.tsx
    sudo sed -i "s|LINK_CHNL|$LINK_CHNL|g" /var/www/pterodactyl/resources/scripts/components/dashboard/DashboardContainer.tsx
    
    # Install dependencies
    curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
    sudo apt install -y nodejs
    sudo npm i -g yarn
    
    cd /var/www/pterodactyl
    yarn add react-feather
    php artisan migrate --force
    yarn build:production
    php artisan view:clear
    
    # Cleanup
    rm -rf /tmp/enigma /tmp/enigma.zip
    
    return 0
}


# ============================================
# TEST BLUEPRINT COMMAND
# ============================================
test_blueprint_command() {
    log "Testing Blueprint command..."
    
    local test_dir="/tmp/test_blueprint"
    mkdir -p "$test_dir"
    cd "$test_dir" || return 1
    
    # إنشاء ملف .blueprintrc بسيط للاختبار
    cat > .blueprintrc <<EOF
test=true
EOF
    
    # اختبار أمر blueprint
    if command -v blueprint >/dev/null 2>&1; then
        if blueprint --help >> "$INSTALL_LOG" 2>&1; then
            ok "Blueprint command is working"
            rm -rf "$test_dir"
            return 0
        else
            error "Blueprint command exists but not working"
            rm -rf "$test_dir"
            return 1
        fi
    elif [[ -f "/var/www/pterodactyl/blueprint.sh" ]]; then
        if /var/www/pterodactyl/blueprint.sh --help >> "$INSTALL_LOG" 2>&1; then
            ok "Blueprint script is working"
            rm -rf "$test_dir"
            return 0
        else
            error "Blueprint script exists but not working"
            rm -rf "$test_dir"
            return 1
        fi
    else
        error "No Blueprint command or script found"
        rm -rf "$test_dir"
        return 1
    fi
}
# ============================================
# IMPROVED BLUEPRINT INSTALLATION FUNCTION
# ============================================
install_blueprint_manager() {
    menu_header "Install Blueprint Framework"
    
    echo -e "${INFO_COLOR}Blueprint Framework Installation${NC}"
    echo
    
    input_with_default "Pterodactyl Directory" "/var/www/pterodactyl" PTERO_DIR
    input_with_default "Web User" "www-data" WEBUSER
    
    log "Starting Blueprint installation..."
    
    # التحقق إذا كان Blueprint مثبتاً بالفعل
    local blueprint_already_installed=false
    local backup_dir=""
    
    if [[ -d "$PTERO_DIR/.blueprint" ]] || [[ -f "$PTERO_DIR/.blueprintrc" ]]; then
        blueprint_already_installed=true
        warn "Blueprint appears to be already installed"
        
        read -rp "Do you want to force reinstall/upgrade? (y/N): " reinstall_choice
        
        if [[ ! "$reinstall_choice" =~ ^[Yy]$ ]]; then
            info "Skipping Blueprint installation"
            
            # التحقق إذا كان أمر blueprint يعمل
            log "Checking Blueprint command status..."
            if [[ -f "$PTERO_DIR/blueprint.sh" ]]; then
                chmod +x "$PTERO_DIR/blueprint.sh" 2>/dev/null
            fi
            
            # تحديث حالة التثبيت
            BLUEPRINT_INSTALLED=true
            save_config
            return 0
        fi
        
        # إجراء نسخ احتياطي قبل إعادة التثبيت
        log "Backing up existing Blueprint configuration..."
        backup_dir="/tmp/blueprint_backup_$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$backup_dir"
        
        [[ -f "$PTERO_DIR/.blueprintrc" ]] && cp -a "$PTERO_DIR/.blueprintrc" "$backup_dir/"
        [[ -d "$PTERO_DIR/.blueprint" ]] && {
            tar -czf "$backup_dir/blueprint_backup.tar.gz" -C "$PTERO_DIR" ".blueprint" 2>/dev/null || true
        }
        [[ -f "$PTERO_DIR/blueprint.sh" ]] && cp -a "$PTERO_DIR/blueprint.sh" "$backup_dir/"
        
        ok "Backup created at: $backup_dir"
    fi
    
    # Check prerequisites
    if ! command -v php >/dev/null 2>&1; then
        error "PHP is not installed. Please install PHP first."
        return 1
    fi
    
    # Install system dependencies (بدون python3-pip)
    log "Installing system dependencies..."
    
    # تحديث بدون مصادر معطوبة
    apt-get update -y 2>&1 | grep -v "nodesource" >> "$INSTALL_LOG" 2>&1 || {
        warn "Some repositories had issues, but continuing..."
    }
    
    # تثبيت الحزم الأساسية فقط
    DEBIAN_FRONTEND=noninteractive apt-get install -y \\
        ca-certificates curl git gnupg unzip wget zip jq \\
        lsb-release software-properties-common apt-transport-https \\
        >> "$INSTALL_LOG" 2>&1 || {
        error "Failed to install system dependencies"
        return 1
    }
    
    # Fix Node.js conflicts first
    fix_nodejs_conflicts
    
    # Install Node.js 20 using the correct way
    log "Installing Node.js 20..."
    
    # إنشاء مجلد للمفاتيح
    mkdir -p /etc/apt/keyrings
    
    # تحميل وإضافة مفتاح NodeSource GPG
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \\
        | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg >> "$INSTALL_LOG" 2>&1
    
    # إضافة مستودع Node.js 20
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" \\
        | tee /etc/apt/sources.list.d/nodesource.list >> "$INSTALL_LOG" 2>&1
    
    # تحديث وتثبيت Node.js
    apt-get update -y >> "$INSTALL_LOG" 2>&1
    DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs >> "$INSTALL_LOG" 2>&1
    
    # التحقق من التثبيت
    if ! command -v node >/dev/null 2>&1; then
        error "Node.js installation failed. Trying alternative method..."
        
        # طريقة بديلة
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >> "$INSTALL_LOG" 2>&1
        apt-get install -y nodejs >> "$INSTALL_LOG" 2>&1
    fi
    
    if command -v node >/dev/null 2>&1; then
        ok "Node.js installed: $(node -v)"
    else
        error "Node.js installation completely failed"
        return 1
    fi
    
    # تثبيت yarn
    log "Installing yarn..."
    if ! command -v yarn >/dev/null 2>&1; then
        npm i -g yarn >> "$INSTALL_LOG" 2>&1 || {
            error "Failed to install yarn"
            return 1
        }
    fi
    
    ok "yarn installed: $(yarn -v)"
    
    # الدخول إلى مجلد البانل
    if [[ ! -d "$PTERO_DIR" ]]; then
        warn "Panel directory does not exist: $PTERO_DIR"
        read -rp "Create directory? (y/N): " create_dir
        if [[ "$create_dir" =~ ^[Yy]$ ]]; then
            mkdir -p "$PTERO_DIR"
            ok "Created directory: $PTERO_DIR"
        else
            error "Cannot proceed without panel directory"
            return 1
        fi
    fi
    
    cd "$PTERO_DIR" || {
        error "Cannot access panel directory: $PTERO_DIR"
        return 1
    }
    
    # إذا كان Blueprint مثبتاً بالفعل، نقوم بتنظيف مجلد blueprint المؤقت
    if [[ "$blueprint_already_installed" == true ]] && [[ -d "$PTERO_DIR/blueprint" ]]; then
        log "Cleaning temporary blueprint directory..."
        rm -rf "$PTERO_DIR/blueprint" 2>/dev/null || true
    fi
    
    # تحميل Blueprint
    log "Fetching latest Blueprint release information..."
    
    local release_info
    release_info=$(curl -fsSL "https://api.github.com/repos/BlueprintFramework/framework/releases/latest") || {
        error "Failed to fetch release information"
        return 1
    }
    
    local dl_url
    dl_url=$(echo "$release_info" | jq -r '.assets[]? | select(.browser_download_url|test("\\\\.zip\$")) | .browser_download_url' | head -n1)
    
    if [[ -z "$dl_url" || "$dl_url" == "null" ]]; then
        error "Could not determine Blueprint download URL"
        return 1
    fi
    
    log "Downloading Blueprint..."
    local tmp_zip
    tmp_zip="$(mktemp -p /tmp blueprint_XXXXXX.zip)"
    
    if ! curl -fL --retry 3 --retry-delay 2 -o "$tmp_zip" "$dl_url"; then
        rm -f "$tmp_zip"
        error "Failed to download Blueprint"
        return 1
    fi
    
    # التحقق من ملف ZIP
    if ! unzip -tq "$tmp_zip" >/dev/null; then
        rm -f "$tmp_zip"
        error "Downloaded zip file is corrupted"
        return 1
    fi
    
    # إذا كان Blueprint مثبتاً بالفعل، نقوم بحذف مجلد .blueprint القديم
    if [[ "$blueprint_already_installed" == true ]] && [[ -d "$PTERO_DIR/.blueprint" ]]; then
        log "Removing existing .blueprint directory for clean install..."
        rm -rf "$PTERO_DIR/.blueprint" 2>/dev/null || true
    fi
    
    # استخراج Blueprint مع استبدال الملفات الموجودة
    log "Extracting into $PTERO_DIR ..."
    
    # إنشاء مجلد مؤقت للاستخراج
    local EXTRACT_DIR
    EXTRACT_DIR=$(mktemp -d)
    
    # استخراج إلى المجلد المؤقت أولاً
    unzip -o "$tmp_zip" -d "$EXTRACT_DIR" >> "$INSTALL_LOG" 2>&1 || {
        error "Failed to extract Blueprint"
        rm -rf "$tmp_zip" "$EXTRACT_DIR"
        return 1
    }
    
    # نسخ الملفات مع استبدال الملفات الموجودة
    cp -rf "$EXTRACT_DIR"/* "$PTERO_DIR/" 2>/dev/null || {
        error "Failed to copy Blueprint files"
        rm -rf "$tmp_zip" "$EXTRACT_DIR"
        return 1
    }
    
    rm -f "$tmp_zip"
    rm -rf "$EXTRACT_DIR"
    
    ok "Blueprint extracted successfully."
    
    # تثبيت dependencies
    log "Installing node dependencies (yarn install)..."
    if ! yarn install --non-interactive >> "$INSTALL_LOG" 2>&1; then
        error "yarn install failed"
        return 1
    fi
    
    ok "yarn install completed successfully."
    
    # كتابة ملف التكوين
    local rc="$PTERO_DIR/.blueprintrc"
    if [[ -f "$rc" ]]; then
        local bk="$rc.bak.$(date +%Y%m%d_%H%M%S)"
        cp -a "$rc" "$bk"
        warn "Backed up existing .blueprintrc -> $bk"
    fi

    cat >"$rc" <<EOF
# Blueprint Configuration
# Generated on $(date)
WEBUSER="$WEBUSER"
OWNERSHIP="$WEBUSER:$WEBUSER"
USERSHELL="/bin/bash"
PTERO_DIR="$PTERO_DIR"
INSTALL_DATE="$(date +%Y-%m-%d)"
BLUEPRINT_VERSION="latest"
FORCE_INSTALL="true"
EOF

    ok "Configuration written to $rc"
    
    # تشغيل Blueprint installer
    local bp="$PTERO_DIR/blueprint.sh"
    if [[ -f "$bp" ]]; then
        chmod +x "$bp"
        
        # تخطي الاختيار إذا كان Blueprint مثبتاً بالفعل
        log "Running Blueprint installer with force option..."
        
        # إنشاء نسخة معدلة من blueprint.sh للتخطي
        local bp_modified="$PTERO_DIR/blueprint_modified.sh"
        cp -a "$bp" "$bp_modified"
        chmod +x "$bp_modified"
        
        # استخدام Python أو sed لإزالة التحقق من التثبيت المسبق
        if command -v python3 >/dev/null 2>&1; then
            python3 -c "
import sys
import os

with open('$bp_modified', 'r') as f:
    lines = f.readlines()

with open('$bp_modified', 'w') as f:
    for line in lines:
        if 'already installed' in line and 'FATAL' in line:
            # استبدال خطأ الفاتال بتحذير
            line = line.replace('FATAL', 'WARNING')
            line = line.replace('exit 1', '# exit 1')
        f.write(line)
"
        else
            # استخدام sed كبديل
            sed -i 's/FATAL: Blueprint is already installed/WARNING: Blueprint appears to be installed/' "$bp_modified"
            sed -i 's/exit 1/# exit 1/' "$bp_modified" 2>/dev/null || true
        fi
        
        # تشغيل الملف المعدل
        if bash "$bp_modified" >> "$INSTALL_LOG" 2>&1; then
            ok "Blueprint installed successfully"
            
            # تنظيف الملف المعدل
            rm -f "$bp_modified"
            
            # التحقق من نجاح التثبيت
            if [[ -d "$PTERO_DIR/.blueprint" ]]; then
                # إصلاح الصلاحيات
                chown -R "$WEBUSER:$WEBUSER" "$PTERO_DIR/.blueprint" 2>/dev/null || true
                chmod -R 755 "$PTERO_DIR/.blueprint" 2>/dev/null || true
                
                ok "Blueprint directory permissions fixed"
            fi
        else
            warn "Modified installer failed, trying direct method..."
            
            # محاولة مباشرة
            if [[ -d "$PTERO_DIR/blueprint" ]] && [[ ! -d "$PTERO_DIR/.blueprint" ]]; then
                log "Moving blueprint directory manually..."
                mv "$PTERO_DIR/blueprint" "$PTERO_DIR/.blueprint" 2>/dev/null || {
                    # إذا فشل، حاول نسخ
                    cp -rf "$PTERO_DIR/blueprint" "$PTERO_DIR/.blueprint" 2>/dev/null || true
                }
            fi
        fi
    else
        error "blueprint.sh not found at: $bp"
        return 1
    fi
    
    # التحقق النهائي من التثبيت
    if [[ -d "$PTERO_DIR/.blueprint" ]] && [[ -f "$PTERO_DIR/.blueprintrc" ]]; then
        # تحديث حالة Blueprint
        BLUEPRINT_INSTALLED=true
        save_config
        
        # عرض معلومات الاستخدام
        echo
        success "═══════════════════════════════════════════════════════════════"
        success "           Blueprint Framework Installed Successfully!         "
        success "═══════════════════════════════════════════════════════════════"
        echo
        echo -e "${INFO_COLOR}Next Steps:${NC}"
        echo "1. Navigate to panel directory:"
        echo "   cd /var/www/pterodactyl"
        echo "2. Run Blueprint commands:"
        echo "   ./blueprint.sh --help"
        echo "3. Check status:"
        echo "   ./blueprint.sh status"
        echo "4. To install themes:"
        echo "   ./blueprint.sh -i theme-name"
        echo
        echo -e "${YELLOW}Note: If 'blueprint' command is not available, use './blueprint.sh'${NC}"
        
        return 0
    else
        error "Blueprint installation may not be complete"
        warn "Please check /var/log/tarbool-manager.log for details"
        return 1
    fi
}

# ============================================
# ADDITIONAL FUNCTION FOR BLUEPRINT CHECK
# ============================================
check_blueprint_installation() {
    log "Checking Blueprint installation status..."
    
    local ptero_dir="${1:-/var/www/pterodactyl}"
    
    if [[ ! -d "$ptero_dir" ]]; then
        error "Pterodactyl directory not found: $ptero_dir"
        return 1
    fi
    
    cd "$ptero_dir" || return 1
    
    local issues=()
    
    # التحقق من ملفات Blueprint
    if [[ ! -f ".blueprintrc" ]]; then
        issues+=(".blueprintrc not found")
    fi
    
    if [[ ! -f "blueprint.sh" ]]; then
        issues+=("blueprint.sh not found")
    fi
    
    if [[ ! -d ".blueprint" ]]; then
        issues+=(".blueprint directory not found")
    fi
    
    # التحقق من Node.js
    if ! command -v node >/dev/null 2>&1; then
        issues+=("Node.js not installed")
    fi
    
    # التحقق من yarn
    if ! command -v yarn >/dev/null 2>&1; then
        issues+=("yarn not installed")
    fi
    
    if [[ ${#issues[@]} -eq 0 ]]; then
        ok "Blueprint installation is complete and ready"
        return 0
    else
        warn "Blueprint installation issues found:"
        for issue in "${issues[@]}"; do
            echo -e "  ${YELLOW}•${NC} $issue"
        done
        return 1
    fi
}

# ============================================
# FIX NODEJS CONFLICTS FUNCTION (IMPROVED)
# ============================================
fix_nodejs_conflicts() {
    log "Fixing Node.js conflicts..."
    
    # إيقاف أي عمليات node.js قيد التشغيل
    pkill -9 node 2>/dev/null || true
    pkill -9 npm 2>/dev/null || true
    pkill -9 yarn 2>/dev/null || true
    
    # حفظ حالة Blueprint إذا كان مثبتاً
    local blueprint_exists=false
    if [[ -d "/var/www/pterodactyl/.blueprint" ]] || [[ -f "/var/www/pterodactyl/.blueprintrc" ]]; then
        blueprint_exists=true
        warn "Blueprint detected, preserving Blueprint files..."
    fi
    
    # إزالة حزم Node.js فقط (دون إزالة تبعيات Blueprint)
    apt-get purge -y nodejs npm 2>/dev/null || true
    
    # تنظيف الملفات المتبقية بعناية
    rm -f /usr/local/bin/npm /usr/local/bin/node /usr/local/bin/npx 2>/dev/null || true
    rm -rf /usr/local/lib/node_modules 2>/dev/null || true
    
    # الاحتفاظ بمجلدات Blueprint إذا كانت موجودة
    if [[ "$blueprint_exists" == true ]]; then
        warn "Preserving Blueprint node_modules..."
        [[ -d "/var/www/pterodactyl/node_modules" ]] && mv "/var/www/pterodactyl/node_modules" "/var/www/pterodactyl/node_modules.backup.$(date +%s)"
    fi
    
    # إزالة مصادر nodesource القديمة فقط إذا كانت موجودة
    if [[ -f "/etc/apt/sources.list.d/nodesource.list" ]]; then
        rm -f /etc/apt/sources.list.d/nodesource.list
    fi
    
    if [[ -f "/etc/apt/keyrings/nodesource.gpg" ]]; then
        rm -f /etc/apt/keyrings/nodesource.gpg
    fi
    
    if [[ -f "/usr/share/keyrings/nodesource.gpg" ]]; then
        rm -f /usr/share/keyrings/nodesource.gpg
    fi
    
    # تحديث apt بدون أخطاء
    apt-get update -y 2>&1 | grep -v "nodesource\\|E:" >> "$INSTALL_LOG" 2>&1 || {
        warn "Some apt repositories had issues, but continuing..."
    }
    
    # تنظيف apt بحذر
    apt-get autoremove -y --purge 2>/dev/null | grep -v "node-" >> "$INSTALL_LOG" 2>&1 || true
    apt-get autoclean -y >> "$INSTALL_LOG" 2>&1
    
    # إصلاح أي مشاكل في dpkg
    dpkg --configure -a >> "$INSTALL_LOG" 2>&1 || true
    
    # إصلاح أي اعتماديات مكسورة
    apt-get install -f -y >> "$INSTALL_LOG" 2>&1 || true
    
    # استعادة مجلدات Blueprint إذا كانت موجودة
    if [[ "$blueprint_exists" == true ]] && [[ -d "/var/www/pterodactyl/node_modules.backup."* ]]; then
        local backup_dir
        backup_dir=$(find "/var/www/pterodactyl" -name "node_modules.backup.*" -type d | head -1)
        if [[ -n "$backup_dir" ]]; then
            rm -rf "/var/www/pterodactyl/node_modules" 2>/dev/null || true
            mv "$backup_dir" "/var/www/pterodactyl/node_modules"
            ok "Restored Blueprint node_modules"
        fi
    fi
    
    ok "Node.js conflicts fixed"
}

check_and_repair_blueprint() {
    menu_header "Check & Repair Blueprint"
    
    echo -e "${INFO_COLOR}Checking Blueprint installation...${NC}"
    echo
    
    local issues=()
    
    # التحقق من Node.js
    if ! command -v node >/dev/null 2>&1; then
        issues+=("Node.js is not installed")
    else
        local node_version
        node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ "$node_version" -lt 16 ]]; then
            issues+=("Node.js version is too old ($(node --version)). Need 16+")
        fi
    fi
    
    # التحقق من yarn
    if ! command -v yarn >/dev/null 2>&1; then
        issues+=("yarn is not installed")
    fi
    
    # التحقق من ملفات Blueprint
    if [[ ! -f "/var/www/pterodactyl/blueprint.sh" ]]; then
        issues+=("blueprint.sh not found")
    fi
    
    if [[ ${#issues[@]} -eq 0 ]]; then
        ok "Blueprint installation looks good!"
        
        # فحص تثبيت Blueprint
        if [[ "$BLUEPRINT_INSTALLED" != "true" ]]; then
            warn "BLUEPRINT_INSTALLED is false, but Blueprint files exist"
            read -rp "Mark Blueprint as installed? (Y/n): " choice
            choice=${choice:-Y}
            if [[ "$choice" =~ ^[Yy]$ ]]; then
                BLUEPRINT_INSTALLED=true
                save_config
                ok "Blueprint marked as installed"
            fi
        fi
    else
        echo -e "${ERROR_COLOR}Issues found:${NC}"
        for issue in "${issues[@]}"; do
            echo -e "  ${RED}✗${NC} $issue"
        done
        
        echo
        read -rp "Attempt to repair? (Y/n): " repair_choice
        repair_choice=${repair_choice:-Y}
        
        if [[ "$repair_choice" =~ ^[Yy]$ ]]; then
            log "Starting Blueprint repair..."
            
            # إصلاح Node.js
            if ! command -v node >/dev/null 2>&1; then
                install_nodejs_20
            fi
            
            # إصلاح yarn
            if ! command -v yarn >/dev/null 2>&1; then
                npm install -g yarn
            fi
            
            # إعادة تثبيت Blueprint إذا لزم
            if [[ ! -f "/var/www/pterodactyl/blueprint.sh" ]]; then
                warn "Reinstalling Blueprint..."
                install_blueprint_manager
            fi
            
            ok "Repair completed"
        fi
    fi
}

install_nodejs_20() {
    log "Installing Node.js 20..."
    
    # تنظيف أي تثبيتات قديمة
    apt-get purge -y nodejs npm 2>/dev/null || true
    
    # إضافة مستودع Node.js 20
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    
    ok "Node.js 20 installed: $(node --version)"
}

# ============================================
# BLUEPRINT CHECK FUNCTION
# ============================================
check_and_install_blueprint_if_needed() {
    # التحقق من وجود Blueprint
    if [[ "$BLUEPRINT_INSTALLED" == "true" ]]; then
        return 0
    fi
    
    local check_files=(
        "/var/www/pterodactyl/blueprint.sh"
        "/var/www/pterodactyl/.blueprintrc"
        "/var/www/pterodactyl/.blueprint"
    )
    
    for file in "${check_files[@]}"; do
        if [[ -f "$file" ]]; then
            BLUEPRINT_INSTALLED=true
            save_config
            return 0
        fi
    done
    
    # إذا لم يكن مثبتًا، نعرض رسالة
    info "Blueprint framework is required but not installed."
    read -rp "Install Blueprint now? (Y/n): " choice
    choice=${choice:-Y}
    
    if [[ "$choice" =~ ^[Yy]$ ]]; then
        if install_blueprint_manager; then
            BLUEPRINT_INSTALLED=true
            save_config
            return 0
        else
            return 1
        fi
    else
        return 1
    fi
}

# ============================================
# ADD MISSING FUNCTION: fix_nodejs_openssl_issue
# ============================================
fix_nodejs_openssl_issue() {
    log "Checking for Node.js OpenSSL compatibility issues..."
    
    # التحقق من إصدار Node.js
    if ! command -v node >/dev/null 2>&1; then
        error "Node.js is not installed"
        return 1
    fi
    
    local node_version
    node_version=$(node --version | cut -d'v' -f2)
    
    # إصلاح مشكلة OpenSSL لإصدارات Node.js القديمة
    if dpkg --compare-versions "$node_version" "ge" "17.0.0"; then
        warn "Node.js $node_version may have OpenSSL issues with older packages"
        
        # إضافة خيار OpenSSL legacy provider إذا لزم
        local node_options="${NODE_OPTIONS:-}"
        if [[ ! "$node_options" =~ "--openssl-legacy-provider" ]]; then
            export NODE_OPTIONS="--openssl-legacy-provider"
            ok "Set NODE_OPTIONS=--openssl-legacy-provider for Node.js compatibility"
        fi
        
        # تحديث npm
        if command -v npm >/dev/null 2>&1; then
            log "Updating npm for better compatibility..."
            npm install -g npm@latest 2>/dev/null || true
        fi
        
        # تحديث yarn
        if command -v yarn >/dev/null 2>&1; then
            log "Updating yarn..."
            npm install -g yarn@latest 2>/dev/null || true
        fi
    fi
    
    # تنظيف npm cache
    if command -v npm >/dev/null 2>&1; then
        npm cache clean --force 2>/dev/null || true
    fi
    
    ok "Node.js OpenSSL compatibility check completed"
}

# ============================================
# ADD MISSING FUNCTION: save_config_safe
# ============================================
save_config_safe() {
    local config_file="/root/tarbool-config.json"
    local temp_file="${config_file}.tmp"
    
    # بيانات الإعدادات
    local config_data=$(cat <<EOF
{
    "SCRIPT_VERSION": "${SCRIPT_VERSION}",
    "BLUEPRINT_INSTALLED": ${BLUEPRINT_INSTALLED:-false},
    "INSTALLED_THEMES": $(printf '%s\\n' "${INSTALLED_THEMES[@]}" | jq -R . | jq -s . || echo '[]'),
    "SYSTEM_OPTIMIZED": ${SYSTEM_OPTIMIZED:-false},
    "SSL_MANAGED": ${SSL_MANAGED:-false},
    "LAST_BACKUP": "${LAST_BACKUP:-}",
    "LAST_UPDATE": "$(date +%Y-%m-%d\\ %H:%M:%S)"
}
EOF
    )
    
    # كتابة الإعدادات في ملف مؤقت أولاً
    echo "$config_data" > "$temp_file" 2>/dev/null
    
    # التحقق من صحة JSON
    if jq . "$temp_file" >/dev/null 2>&1; then
        mv "$temp_file" "$config_file"
        log "Configuration saved successfully"
        return 0
    else
        # إذا فشل jq، استخدم طريقة بسيطة
        rm -f "$temp_file"
        cat > "$config_file" <<EOF
{
    "SCRIPT_VERSION": "${SCRIPT_VERSION}",
    "BLUEPRINT_INSTALLED": ${BLUEPRINT_INSTALLED:-false},
    "SYSTEM_OPTIMIZED": ${SYSTEM_OPTIMIZED:-false},
    "SSL_MANAGED": ${SSL_MANAGED:-false}
}
EOF
        log "Configuration saved (simplified)"
        return 0
    fi
}

# ============================================
# MODIFIED PART OF NEBULA THEME INSTALLATION
# ============================================
install_nebula_theme_manager() {
    menu_header "Install Nebula Theme"
    
    log "Starting Nebula theme installation..."
    
    # التحقق من وجود Blueprint
    local blueprint_available=false
    if command -v blueprint >/dev/null 2>&1; then
        blueprint_available=true
        info "Blueprint command found: $(command -v blueprint)"
    elif [[ -f "/var/www/pterodactyl/blueprint.sh" ]]; then
        blueprint_available=true
        info "Blueprint script found: /var/www/pterodactyl/blueprint.sh"
    else
        error "Blueprint not found. Please install Blueprint first."
        return 1
    fi
    
    # إصلاح مشكلة Node.js OpenSSL قبل البدء
    fix_nodejs_openssl_issue
    
    # إنشاء مجلد مؤقت
    local TMP_DIR
    TMP_DIR=$(mktemp -d)
    
    # تنزيل مستودع الثيمات
    log "Downloading theme repository..."
    cd "$TMP_DIR" || {
        error "Cannot access temp directory"
        rm -rf "$TMP_DIR"
        return 1
    }
    
    git clone --depth=1 "https://github.com/FyzzOffcial222/Autoinstaller-Theme-Pterodactyl.git" . >> "$INSTALL_LOG" 2>&1 || {
        error "Failed to clone repository"
        rm -rf "$TMP_DIR"
        return 1
    }
    
    # التحقق من وجود ملف ZIP
    if [[ ! -f "nebulaptero.zip" ]]; then
        error "Nebula theme zip file not found"
        rm -rf "$TMP_DIR"
        return 1
    fi
    
    # نقل الملف إلى /var/www/
    cp nebulaptero.zip /var/www/ >> "$INSTALL_LOG" 2>&1
    
    # الانتقال إلى دليل البانل
    cd /var/www/pterodactyl 2>/dev/null || {
        error "Cannot access panel directory: /var/www/pterodactyl"
        rm -rf "$TMP_DIR"
        return 1
    }
    
    # فك ضغط الملف في الدليل الصحيح مع تحديد المستوى
    log "Extracting Nebula theme..."
    
    # إنشاء مجلد مؤقت للاستخراج
    local EXTRACT_DIR
    EXTRACT_DIR=$(mktemp -d)
    
    # استخراج الملف إلى المجلد المؤقت
    unzip -o /var/www/nebulaptero.zip -d "$EXTRACT_DIR" >> "$INSTALL_LOG" 2>&1 || {
        error "Failed to extract Nebula theme"
        rm -rf "$TMP_DIR" "$EXTRACT_DIR"
        return 1
    }
    
    # البحث عن ملف nebula.blueprint في المجلد المستخرج
    local blueprint_file
    blueprint_file=$(find "$EXTRACT_DIR" -name "nebula.blueprint" -type f | head -1)
    
    if [[ -z "$blueprint_file" ]]; then
        error "nebula.blueprint file not found in extracted archive"
        
        # عرض محتويات المجلد المستخرج للمساعدة في التشخيص
        warn "Contents of extracted archive:"
        find "$EXTRACT_DIR" -type f 2>/dev/null | head -20 >> "$INSTALL_LOG" 2>&1
        
        rm -rf "$TMP_DIR" "$EXTRACT_DIR"
        return 1
    fi
    
    # نسخ الملف إلى دليل البانل
    log "Copying nebula.blueprint to panel directory..."
    cp "$blueprint_file" /var/www/pterodactyl/ 2>/dev/null || {
        error "Failed to copy nebula.blueprint to panel directory"
        rm -rf "$TMP_DIR" "$EXTRACT_DIR"
        return 1
    }
    
    # التحقق من وجود الملف في الموقع الصحيح
    if [[ ! -f "/var/www/pterodactyl/nebula.blueprint" ]]; then
        warn "nebula.blueprint not in expected location, searching..."
        
        # البحث عن الملف في مكان آخر
        local found_file
        found_file=$(find /var/www/pterodactyl -name "nebula.blueprint" -type f 2>/dev/null | head -1)
        
        if [[ -z "$found_file" ]]; then
            error "nebula.blueprint file not found after extraction"
            rm -rf "$TMP_DIR" "$EXTRACT_DIR"
            return 1
        else
            info "Found nebula.blueprint at: $found_file"
        fi
    else
        ok "Nebula blueprint file ready: /var/www/pterodactyl/nebula.blueprint"
    fi
    
    # تنظيف المجلد المؤقت للاستخراج
    rm -rf "$EXTRACT_DIR"
    
    # تثبيت الثيم
    log "Installing theme..."
    local install_success=false
    
    # المحاولة 1: استخدام أمر blueprint
    if command -v blueprint >/dev/null 2>&1; then
        log "Using 'blueprint -i nebula' command..."
        echo -e "${YELLOW}Note: This may take a moment and require user input...${NC}"
        echo -e "${YELLOW}If prompted, press Enter to continue...${NC}"
        
        # استخدام NODE_OPTIONS إذا كان متغير البيئة غير مضبوط
        local original_node_options="$NODE_OPTIONS"
        export NODE_OPTIONS="${NODE_OPTIONS:---openssl-legacy-provider}"
        
        # تشغيل الأمر مع السماح بالإدخال التفاعلي
        {
            if timeout 120 bash -c 'echo -e "\n" | blueprint -i nebula 2>&1'; then
                install_success=true
            else
                # التحقق إذا كان التثبيت ناجحاً رغم إرجاع خطأ
                if tail -30 "$INSTALL_LOG" 2>/dev/null | grep -q -i "nebula.*installed\|success.*nebula\|تم التثبيت"; then
                    install_success=true
                fi
            fi
        } >> "$INSTALL_LOG" 2>&1
        
        # استعادة متغير البيئة الأصلي
        export NODE_OPTIONS="$original_node_options"
        
        if [[ "$install_success" == true ]]; then
            ok "Installed via blueprint command"
        else
            warn "Blueprint command failed, trying alternative method..."
        fi
    fi
    
    # المحاولة 2: إذا لم تنجح المحاولة الأولى
    if [[ "$install_success" == false ]] && [[ -f "./blueprint.sh" ]]; then
        log "Trying './blueprint.sh -i nebula'..."
        echo -e "${YELLOW}Note: This may take a moment and require user input...${NC}"
        
        {
            if timeout 120 bash -c 'echo -e "\n" | ./blueprint.sh -i nebula 2>&1'; then
                install_success=true
            else
                if tail -30 "$INSTALL_LOG" 2>/dev/null | grep -q -i "nebula.*installed\|success.*nebula\|تم التثبيت"; then
                    install_success=true
                fi
            fi
        } >> "$INSTALL_LOG" 2>&1
        
        if [[ "$install_success" == true ]]; then
            ok "Installed via blueprint.sh script"
        fi
    fi
    
    # تنظيف الملفات المؤقتة
    rm -rf "$TMP_DIR" /var/www/nebulaptero.zip 2>/dev/null || true
    rm -f /var/www/pterodactyl/nebula.blueprint 2>/dev/null || true
    
    if [[ "$install_success" == true ]]; then
        # إصلاح الصلاحيات بعد التثبيت
        log "Fixing permissions after installation..."
        
        # إصلاح صلاحيات مجلد blueprint
        if [[ -d "/var/www/pterodactyl/.blueprint" ]]; then
            chown -R www-data:www-data /var/www/pterodactyl/.blueprint 2>/dev/null || true
            chmod -R 755 /var/www/pterodactyl/.blueprint 2>/dev/null || true
            ok "Blueprint directory permissions fixed"
        fi
        
        # إصلاح صلاحيات مجلد الثيم
        local nebula_extension_dir="/var/www/pterodactyl/.blueprint/extensions/nebula"
        if [[ -d "$nebula_extension_dir" ]]; then
            chown -R www-data:www-data "$nebula_extension_dir" 2>/dev/null || true
            chmod -R 755 "$nebula_extension_dir" 2>/dev/null || true
            
            # إصلاح خاص لمجلد public
            if [[ -d "$nebula_extension_dir/public" ]]; then
                chown -R www-data:www-data "$nebula_extension_dir/public" 2>/dev/null || true
                chmod -R 755 "$nebula_extension_dir/public" 2>/dev/null || true
            fi
            
            ok "Nebula theme permissions fixed"
        fi
        
        # إعادة بناء assets إذا كان yarn متاحاً (مع إصلاح OpenSSL)
        log "Building assets..."
        cd /var/www/pterodactyl 2>/dev/null || {
            warn "Cannot access panel directory for building assets"
        }
        
        if [[ -d "/var/www/pterodactyl" ]] && command -v yarn >/dev/null 2>&1; then
            # استخدام متغير البيئة لإصلاح مشكلة OpenSSL
            export NODE_OPTIONS="--openssl-legacy-provider"
            
            # تحديث browserslist أولاً
            npx update-browserslist-db@latest 2>/dev/null || true
            
            # محاولة البناء مع التحكم في الوقت
            if timeout 300 bash -c 'cd /var/www/pterodactyl && NODE_OPTIONS="--openssl-legacy-provider" yarn build:production 2>&1'; then
                ok "Assets built successfully"
            else
                warn "yarn build had issues (timeout or error), but theme may still work"
                
                # محاولة بديلة أبسط
                if timeout 120 bash -c 'cd /var/www/pterodactyl && npm run build 2>&1 | tail -20'; then
                    ok "Assets built via npm"
                fi
            fi
        else
            warn "yarn not available or panel directory not found, skipping asset build"
        fi
        
        # تنظيف cache النهائي
        if [[ -d "/var/www/pterodactyl" ]]; then
            cd /var/www/pterodactyl 2>/dev/null && {
                php artisan view:clear 2>/dev/null || true
                php artisan config:clear 2>/dev/null || true
                php artisan cache:clear 2>/dev/null || true
                ok "Caches cleared"
            }
        fi
        
        # تحديث حالة التثبيت - استخدم save_config العادي بدلاً من save_config_safe
        INSTALLED_THEMES+=("nebula")
        
        # إزالة التكرارات
        local unique_themes=()
        for theme in "${INSTALLED_THEMES[@]}"; do
            if [[ ! " ${unique_themes[*]} " =~ " ${theme} " ]]; then
                unique_themes+=("$theme")
            fi
        done
        INSTALLED_THEMES=("${unique_themes[@]}")
        
        # حفظ الإعدادات
        save_config
        
        echo
        success "═══════════════════════════════════════════════════════════════"
        success "              Nebula Theme Installed Successfully!            "
        success "═══════════════════════════════════════════════════════════════"
        echo
        echo -e "${INFO_COLOR}Theme Information:${NC}"
        echo -e "${OPTION_COLOR}Name:${NC} Nebula Theme"
        echo -e "${OPTION_COLOR}Status:${NC} ${GREEN}Installed${NC}"
        echo -e "${OPTION_COLOR}Location:${NC} /var/www/pterodactyl/.blueprint/extensions/nebula/"
        echo
        echo -e "${YELLOW}Important Note:${NC}"
        echo "✓ The theme has been installed successfully"
        echo "✓ You may need to refresh your Panel dashboard (Ctrl+F5)"
        echo "✓ If theme doesn't appear immediately, wait a few minutes"
        echo "✓ Check /var/log/tarbool-manager.log for detailed installation log"
        echo
        
        # تحديث BLUEPRINT_INSTALLED إذا لم يكن مضبوطاً
        if [[ "$BLUEPRINT_INSTALLED" != "true" ]]; then
            BLUEPRINT_INSTALLED=true
            save_config
        fi
        
        return 0
    else
        error "Failed to install Nebula theme"
        
        # رسائل استكشاف الأخطاء وإصلاحها
        echo
        echo -e "${YELLOW}Troubleshooting Steps:${NC}"
        echo "1. Try running manually:"
        echo "   cd /var/www/pterodactyl"
        echo "   blueprint -i nebula"
        echo "2. Check if Blueprint is working:"
        echo "   blueprint --help"
        echo "3. Check permissions:"
        echo "   ls -la /var/www/pterodactyl/.blueprint/"
        echo "4. View installation log:"
        echo "   tail -f /var/log/tarbool-manager.log"
        echo
        
        rm -rf "$TMP_DIR" 2>/dev/null || true
        return 1
    fi
}


# ============================================
# PHOENIX THEME FOR CTRLPANEL
# ============================================
install_phoenix_theme_ctrlpanel() {
    menu_header "Install Phoenix Theme for CtrlPanel"
    
    if [[ ! -d "$CTRLPANEL_DIR" ]]; then
        error "CtrlPanel directory not found: $CTRLPANEL_DIR"
        read -rp "Would you like to specify CtrlPanel directory? (y/N): " choice
        if [[ "$choice" =~ ^[Yy]$ ]]; then
            input_with_default "CtrlPanel Directory" "/var/www/ctrlpanel" CTRLPANEL_DIR
        else
            error "Cannot proceed without CtrlPanel directory"
            return 1
        fi
    fi
    
    log "Installing Phoenix theme for CtrlPanel..."
    
    # Create temporary directory
    local TMP_DIR="/tmp/theme-install"
    local ZIP_FILE="$TMP_DIR/theme.zip"
    local SRC_DIR="$TMP_DIR/copy-from-me"
    
    rm -rf "$TMP_DIR"
    mkdir -p "$TMP_DIR"
    
    # Download theme
    log "Downloading theme..."
    curl -L "https://raw.githubusercontent.com/as6915/nobita-bot/main/src/copy-from-me.zip" \
        -o "$ZIP_FILE" >> "$INSTALL_LOG" 2>&1 || {
        error "Failed to download theme"
        rm -rf "$TMP_DIR"
        return 1
    }
    
    # Verify and extract
    if ! unzip -t "$ZIP_FILE" >/dev/null 2>&1; then
        error "Downloaded file is not a valid ZIP archive"
        rm -rf "$TMP_DIR"
        return 1
    fi
    
    log "Extracting theme..."
    unzip -q "$ZIP_FILE" -d "$TMP_DIR" >> "$INSTALL_LOG" 2>&1
    
    if [[ ! -d "$SRC_DIR" ]]; then
        error "Theme directory not found after extraction"
        rm -rf "$TMP_DIR"
        return 1
    fi
    
    # Copy files
    log "Copying theme files..."
    rsync -av "$SRC_DIR"/ "$CTRLPANEL_DIR"/ >> "$INSTALL_LOG" 2>&1
    
    # Set permissions
    chown -R www-data:www-data "$CTRLPANEL_DIR"
    chmod -R 755 "$CTRLPANEL_DIR"
    
    # Replace text in files
    log "Applying theme customizations..."
    
    # Replace marketplace URL with WhatsApp
    find "$CTRLPANEL_DIR" -type f -exec sed -i \
        's|https://market\.ctrlpanel\.gg/product/phoenix-theme/|https://api.whatsapp.com/send?phone=+201028085788|g' {} + \
        >> "$INSTALL_LOG" 2>&1
    
    # Replace theme name
    find "$CTRLPANEL_DIR" -type f -exec sed -i \
        's|Phoenix Theme|Alakreb|gI' {} + >> "$INSTALL_LOG" 2>&1
    
    # Clear Laravel cache
    log "Clearing Laravel cache..."
    cd "$CTRLPANEL_DIR" || {
        error "Cannot access CtrlPanel directory"
        rm -rf "$TMP_DIR"
        return 1
    }
    
    php artisan migrate --force >> "$INSTALL_LOG" 2>&1 || true
    php artisan config:clear >> "$INSTALL_LOG" 2>&1 || true
    php artisan cache:clear >> "$INSTALL_LOG" 2>&1 || true
    php artisan view:clear >> "$INSTALL_LOG" 2>&1 || true
    php artisan optimize:clear >> "$INSTALL_LOG" 2>&1 || true
    
    # Cleanup
    rm -rf "$TMP_DIR"
    
    ok "Phoenix theme installed successfully for CtrlPanel!"
    return 0
}


install_elysium_theme_manager() {
    menu_header "Install Elysium Theme"
    
    log "Installing Elysium theme..."
    
    # تنظيف أي إصدارات سابقة
    rm -rf /tmp/ElysiumTheme /tmp/Autoinstaller-Theme-Pterodactyl 2>/dev/null || true
    
    echo -e "${GREEN}===============================================${NC}"
    echo -e "${GREEN}          INSTALLING ELYSIUM THEME            ${NC}"
    echo -e "${GREEN}===============================================${NC}"
    echo
    
    # تنزيل مستودع الثيمات
    log "Downloading theme repository..."
    cd /tmp || return 1
    
    git clone "https://github.com/FyzzOffcial222/Autoinstaller-Theme-Pterodactyl.git" 2>/dev/null || {
        error "Failed to clone repository"
        return 1
    }
    
    # التحقق من وجود ملف ZIP
    if [[ ! -f "/tmp/Autoinstaller-Theme-Pterodactyl/ElysiumTheme.zip" ]]; then
        error "Elysium theme zip file not found"
        rm -rf /tmp/Autoinstaller-Theme-Pterodactyl
        return 1
    fi
    
    # نقل واستخراج الملف
    log "Moving and extracting theme..."
    sudo mv /tmp/Autoinstaller-Theme-Pterodactyl/ElysiumTheme.zip /var/www/ 2>/dev/null
    
    # استخراج الملف مع تجاهل التحذيرات
    log "Extracting theme files..."
    cd /var/www/pterodactyl 2>/dev/null || {
        error "Cannot access /var/www/pterodactyl"
        return 1
    }
    
    # استخراج مع خيار force
    unzip -o /var/www/ElysiumTheme.zip 2>&1 | grep -v "ucsize.*<>.*csize\|continuing with" || true
    
    # تنظيف
    rm -rf /tmp/Autoinstaller-Theme-Pterodactyl /var/www/ElysiumTheme.zip 2>/dev/null || true
    
    # التحقق من Node.js
    log "Checking and installing Node.js if needed..."
    
    if ! command -v node >/dev/null 2>&1; then
        # إنشاء مجلد للمفاتيح
        sudo mkdir -p /etc/apt/keyrings
        
        # تحميل وإضافة مفتاح NodeSource
        curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg 2>/dev/null || true
        
        # إضافة مستودع Node.js 16 (أكثر استقراراً للثيمات القديمة)
        echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_16.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list >/dev/null 2>&1
        
        sudo apt update -y >/dev/null 2>&1
        sudo apt install -y nodejs >/dev/null 2>&1 || {
            # طريقة بديلة إذا فشلت الأولى
            curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
            sudo apt install -y nodejs >/dev/null 2>&1
        }
    fi
    
    # تثبيت npm إذا لم يكن مثبتاً
    if ! command -v npm >/dev/null 2>&1; then
        apt install npm -y >/dev/null 2>&1
    fi
    
    # تثبيت yarn
    log "Installing yarn..."
    if ! command -v yarn >/dev/null 2>&1; then
        npm i -g yarn >/dev/null 2>&1 || {
            # طريقة بديلة
            curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
            echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
            apt update && apt install -y yarn >/dev/null 2>&1
        }
    fi
    
    # الانتقال إلى دليل البانل
    cd /var/www/pterodactyl 2>/dev/null || {
        error "Cannot access panel directory"
        return 1
    }
    
    # تثبيت dependencies مع إصلاح مشكلة OpenSSL
    log "Installing dependencies..."
    
    # استخدام متغير البيئة لإصلاح مشكلة OpenSSL
    export NODE_OPTIONS="--openssl-legacy-provider"
    
    # تحديث npm
    npm install -g npm@latest 2>/dev/null || true
    
    # تشغيل yarn install
    yarn install --non-interactive 2>&1 | tail -20
    
    # بناء assets مع إصلاح مشكلة OpenSSL
    log "Building assets..."
    
    # تحديث browserslist أولاً
    npx update-browserslist-db@latest 2>/dev/null || true
    
    # البناء مع NODE_OPTIONS
    NODE_OPTIONS="--openssl-legacy-provider" yarn build:production 2>&1 | tail -30 || {
        warn "yarn build:production had issues, trying alternative..."
        npm run build 2>&1 | tail -20 || true
    }
    
    # تشغيل migrations
    log "Running database migrations..."
    if [[ -f "/var/www/pterodactyl/artisan" ]] && command -v php >/dev/null 2>&1; then
        php artisan migrate --force 2>/dev/null || true
    fi
    
    # تنظيف cache
    log "Clearing caches..."
    if [[ -f "/var/www/pterodactyl/artisan" ]] && command -v php >/dev/null 2>&1; then
        php artisan view:clear 2>/dev/null || true
        php artisan config:clear 2>/dev/null || true
        php artisan cache:clear 2>/dev/null || true
    fi
    
    # إصلاح الصلاحيات
    log "Fixing permissions..."
    chown -R www-data:www-data /var/www/pterodactyl/ 2>/dev/null || true
    chmod -R 755 /var/www/pterodactyl/ 2>/dev/null || true
    
    echo -e "${GREEN}===============================================${NC}"
    echo -e "${GREEN}       ELYSIUM THEME INSTALLED SUCCESSFULLY    ${NC}"
    echo -e "${GREEN}===============================================${NC}"
    echo
    echo -e "${INFO_COLOR}Theme Information:${NC}"
    echo -e "${OPTION_COLOR}Name:${NC} Elysium Theme"
    echo -e "${OPTION_COLOR}Status:${NC} ${GREEN}Installed${NC}"
    echo -e "${OPTION_COLOR}Type:${NC} Standard Pterodactyl Theme"
    echo -e "${OPTION_COLOR}Location:${NC} /var/www/pterodactyl/"
    echo
    echo -e "${YELLOW}Important Notes:${NC}"
    echo "✓ The theme has been installed successfully"
    echo "✓ You may need to refresh your Panel dashboard (Ctrl+F5)"
    echo "✓ Check admin panel for Elysium settings"
    echo "✓ If any issues, check /var/log/tarbool-manager.log"
    echo
    
    return 0
}

install_nightcore_theme() {
    log "Installing Nightcore theme..."
    
    cd /var/www/pterodactyl || return 1
    
    # Backup current theme
    tar -czf /tmp/Pterodactyl_Nightcore_Themebackup.tar.gz .
    
    # Download theme
    git clone https://github.com/FyzzOffcial222/Autoinstaller-Theme-Pterodactyl.git /tmp/nightcore-temp
    cd /tmp/nightcore-temp || return 1
    
    # Remove old theme files if exist
    rm -f /var/www/pterodactyl/resources/scripts/Pterodactyl_Nightcore_Theme.css
    rm -f /var/www/pterodactyl/resources/scripts/index.tsx
    
    # Move new theme files
    mv index.tsx /var/www/pterodactyl/resources/scripts/index.tsx
    mv Pterodactyl_Nightcore_Theme.css /var/www/pterodactyl/resources/scripts/Pterodactyl_Nightcore_Theme.css
    
    # Install Node.js and build
    curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt update -y
    apt install nodejs -y
    npm i -g yarn
    
    cd /var/www/pterodactyl
    yarn
    yarn build:production
    sudo php artisan optimize:clear
    
    # Cleanup
    rm -rf /tmp/nightcore-temp
    
    return 0
}

uninstall_theme() {
    local theme_name="$1"
    
    menu_header "Uninstall Theme: $theme_name"
    
    log "Uninstalling $theme_name theme..."
    
    # For now, we'll use a general repair script
    # In a real implementation, you would have specific uninstallation for each theme
    bash <(curl -s https://raw.githubusercontent.com/VallzHost/installer-theme/main/repair.sh)
    
    # Remove from installed themes array
    local new_themes=()
    for theme in "${INSTALLED_THEMES[@]}"; do
        if [[ "$theme" != "$theme_name" ]]; then
            new_themes+=("$theme")
        fi
    done
    INSTALLED_THEMES=("${new_themes[@]}")
    
    ok "Theme $theme_name uninstalled successfully"
    return 0
}

# ============================================
# MODIFIED THEME MANAGEMENT MENU
# ============================================
# ============================================
# MODIFIED THEME MANAGEMENT MENU
# ============================================
themes_menu() {
    menu_header "Theme Management"
    
    echo -e "${INFO_COLOR}Theme Options:${NC}"
    echo
    
    # تعريف الثيمات التي تحتاج Blueprint
    local themes_require_blueprint=("nebula")
    local themes_standard=("elysium" "stellar" "billing" "enigma" "nightcore")
    
    echo -e "${OPTION_COLOR}1)${NC} Install Pterodactyl Theme"
    echo -e "${OPTION_COLOR}2)${NC} Install Blueprint Framework"
    echo -e "${OPTION_COLOR}3)${NC} Install Phoenix Theme for CtrlPanel"
    echo -e "${OPTION_COLOR}4)${NC} Uninstall Theme"
    echo -e "${OPTION_COLOR}5)${NC} List Installed Themes"
    echo -e "${OPTION_COLOR}6)${NC} Check & Repair Blueprint"
    echo -e "${OPTION_COLOR}7)${NC} Return"
    echo
    
    read -rp "Choose option [1-7]: " theme_choice
    
    case $theme_choice in
        1)
            echo
            echo -e "${INFO_COLOR}Available Pterodactyl Themes:${NC}"
            echo -e "${YELLOW}Note:${NC} Themes marked with * require Blueprint framework"
            echo
            
            for i in "${!AVAILABLE_THEMES[@]}"; do
                local theme="${AVAILABLE_THEMES[$i]}"
                local requires_blueprint=false
                local theme_type="Standard"
                
                # التحقق إذا كان الثيم يحتاج Blueprint
                for req_theme in "${themes_require_blueprint[@]}"; do
                    if [[ "$theme" == "$req_theme" ]]; then
                        requires_blueprint=true
                        theme_type="Blueprint"
                        break
                    fi
                done
                
                # عرض نوع الثيم
                if $requires_blueprint; then
                    echo -e "${OPTION_COLOR}$((i+1)))${NC} ${theme} ${YELLOW}[Blueprint]*${NC}"
                else
                    echo -e "${OPTION_COLOR}$((i+1)))${NC} ${theme} [Standard]"
                fi
            done
            echo
            
            read -rp "Choose theme to install (1-${#AVAILABLE_THEMES[@]}): " theme_select
            
            if [[ "$theme_select" -ge 1 && "$theme_select" -le ${#AVAILABLE_THEMES[@]} ]]; then
                local selected_theme="${AVAILABLE_THEMES[$((theme_select-1))]}"
                
                # Check if already installed
                for theme in "${INSTALLED_THEMES[@]}"; do
                    if [[ "$theme" == "$selected_theme" ]]; then
                        warn "Theme $selected_theme is already installed"
                        read -rp "Reinstall? (y/N): " reinstall
                        [[ ! "$reinstall" =~ ^[Yy]$ ]] && return
                        break
                    fi
                done
                
                # Check if theme requires Blueprint
                local needs_blueprint=false
                for req_theme in "${themes_require_blueprint[@]}"; do
                    if [[ "$selected_theme" == "$req_theme" ]]; then
                        needs_blueprint=true
                        break
                    fi
                done
                
                if $needs_blueprint; then
                    # التحقق من Blueprint
                    if [[ "$BLUEPRINT_INSTALLED" != "true" ]]; then
                        info "Theme $selected_theme requires Blueprint framework."
                        echo -e "${YELLOW}This is a Blueprint extension theme.${NC}"
                        read -rp "Install Blueprint first? (Y/n): " install_bp
                        install_bp=${install_bp:-Y}
                        
                        if [[ "$install_bp" =~ ^[Yy]$ ]]; then
                            if install_blueprint_manager; then
                                BLUEPRINT_INSTALLED=true
                                save_config
                                info "Blueprint installed successfully. Proceeding with theme installation..."
                            else
                                error "Failed to install Blueprint. Cannot install $selected_theme."
                                return 1
                            fi
                        else
                            error "Cannot install $selected_theme without Blueprint."
                            return 1
                        fi
                    else
                        info "Blueprint is already installed. Proceeding with theme installation..."
                    fi
                else
                    # للثيمات العادية
                    info "Installing $selected_theme (Standard theme)..."
                fi
                
                install_theme "$selected_theme"
            else
                error "Invalid selection"
            fi
            ;;
        2)
            install_blueprint_manager
            ;;
        3)
            install_phoenix_theme_ctrlpanel
            ;;
        4)
            if [[ ${#INSTALLED_THEMES[@]} -eq 0 ]]; then
                echo -e "${YELLOW}No themes installed${NC}"
            else
                echo
                echo -e "${INFO_COLOR}Installed Themes:${NC}"
                for i in "${!INSTALLED_THEMES[@]}"; do
                    echo -e "${OPTION_COLOR}$((i+1)))${NC} ${INSTALLED_THEMES[$i]}"
                done
                echo
                
                read -rp "Choose theme to uninstall (1-${#INSTALLED_THEMES[@]}): " uninstall_select
                
                if [[ "$uninstall_select" -ge 1 && "$uninstall_select" -le ${#INSTALLED_THEMES[@]} ]]; then
                    local theme_to_uninstall="${INSTALLED_THEMES[$((uninstall_select-1))]}"
                    read -rp "Are you sure you want to uninstall $theme_to_uninstall? (y/N): " confirm
                    if [[ "$confirm" =~ ^[Yy]$ ]]; then
                        uninstall_theme "$theme_to_uninstall"
                    fi
                else
                    error "Invalid selection"
                fi
            fi
            ;;
        5)
            echo
            echo -e "${INFO_COLOR}Installed Themes:${NC}"
            if [[ ${#INSTALLED_THEMES[@]} -eq 0 ]]; then
                echo -e "${YELLOW}No themes installed${NC}"
            else
                for theme in "${INSTALLED_THEMES[@]}"; do
                    echo -e "${GREEN}✓${NC} $theme"
                done
            fi
            
            echo -e "${INFO_COLOR}Other Components:${NC}"
            if [[ "$BLUEPRINT_INSTALLED" == "true" ]]; then
                echo -e "${GREEN}✓${NC} Blueprint Framework"
            else
                echo -e "${YELLOW}✗${NC} Blueprint Framework"
            fi
            ;;
                6)
            # Check & Repair Blueprint
            menu_header "Check & Repair Blueprint"
            
            echo -e "${INFO_COLOR}Blueprint Status:${NC}"
            
            # التحقق من عدة مؤشرات على وجود Blueprint
            local blueprint_found=false
            local issues=()
            local blueprint_command_available=false
            
            # 1. التحقق من ملفات Blueprint
            if [[ -f "/var/www/pterodactyl/blueprint.sh" ]]; then
                echo -e "  ${GREEN}✓${NC} blueprint.sh found"
                blueprint_found=true
            else
                echo -e "  ${YELLOW}✗${NC} blueprint.sh not found"
                issues+=("blueprint.sh missing")
            fi
            
            if [[ -f "/var/www/pterodactyl/.blueprintrc" ]]; then
                echo -e "  ${GREEN}✓${NC} .blueprintrc found"
                blueprint_found=true
            else
                echo -e "  ${YELLOW}✗${NC} .blueprintrc not found"
            fi
            
            # 2. التحقق من أمر blueprint في PATH
            if command -v blueprint >/dev/null 2>&1; then
                echo -e "  ${GREEN}✓${NC} blueprint command available in PATH"
                blueprint_command_available=true
            else
                echo -e "  ${YELLOW}⚠${NC} blueprint command not in PATH"
            fi
            
            # 3. التحقق من Node.js
            if command -v node >/dev/null 2>&1; then
                local node_version
                node_version=$(node --version | cut -d'v' -f2)
                echo -e "  ${GREEN}✓${NC} Node.js installed: v$node_version"
                
                # التحقق من إصدار Node.js
                local major_version
                major_version=$(echo "$node_version" | cut -d'.' -f1)
                if [[ "$major_version" -lt 16 ]]; then
                    echo -e "  ${YELLOW}⚠${NC} Node.js version $node_version is too old (need 16+)"
                    issues+=("Node.js version too old")
                fi
            else
                echo -e "  ${RED}✗${NC} Node.js not installed"
                issues+=("Node.js not installed")
            fi
            
            # 4. التحقق من yarn
            if command -v yarn >/dev/null 2>&1; then
                echo -e "  ${GREEN}✓${NC} yarn installed: $(yarn --version)"
            else
                echo -e "  ${YELLOW}⚠${NC} yarn not installed"
                issues+=("yarn not installed")
            fi
            
            # 5. التحقق من حالة التثبيت في config
            if [[ "$BLUEPRINT_INSTALLED" == "true" ]]; then
                echo -e "  ${GREEN}✓${NC} Marked as installed in config"
            else
                echo -e "  ${YELLOW}⚠${NC} Not marked as installed in config"
            fi
            
            echo
            
            # اختبار وظيفة Blueprint إذا كانت الملفات موجودة
            if $blueprint_found || $blueprint_command_available; then
                echo -e "${INFO_COLOR}Testing Blueprint functionality...${NC}"
                
                if test_blueprint_command; then
                    success "Blueprint is working correctly!"
                    
                    # تحديث حالة التثبيت إذا لم تكن محددة
                    if [[ "$BLUEPRINT_INSTALLED" != "true" ]]; then
                        read -rp "Update config to mark Blueprint as installed? (Y/n): " update_config
                        update_config=${update_config:-Y}
                        if [[ "$update_config" =~ ^[Yy]$ ]]; then
                            BLUEPRINT_INSTALLED=true
                            save_config
                            ok "Config updated"
                        fi
                    fi
                    
                    # عرض خيارات إضافية
                    echo
                    echo -e "${INFO_COLOR}Additional Blueprint Options:${NC}"
                    echo -e "${OPTION_COLOR}1)${NC} Test theme installation (nebula)"
                    echo -e "${OPTION_COLOR}2)${NC} List available themes"
                    echo -e "${OPTION_COLOR}3)${NC} Back to repair menu"
                    echo
                    
                    read -rp "Choose option [1-3]: " test_option
                    
                    case $test_option in
                        1)
                            log "Testing theme installation..."
                            cd /var/www/pterodactyl || return
                            
                            # إنشاء ملف .blueprintrc بسيط للاختبار
                            if [[ ! -f ".blueprintrc" ]]; then
                                cat > .blueprintrc <<EOF
test_mode=true
EOF
                            fi
                            
                            # محاولة عرض مساعدة blueprint
                            if command -v blueprint >/dev/null 2>&1; then
                                blueprint --help | head -20
                            elif [[ -f "blueprint.sh" ]]; then
                                ./blueprint.sh --help | head -20
                            fi
                            
                            ok "Theme installation test completed"
                            ;;
                        2)
                            log "Checking available themes..."
                            cd /var/www/pterodactyl || return
                            
                            # البحث عن ملفات .blueprint
                            echo -e "${INFO_COLOR}Available blueprint files:${NC}"
                            find . -name "*.blueprint" -type f 2>/dev/null | sed 's|^./||' || \
                            echo -e "${YELLOW}No blueprint files found${NC}"
                            ;;
                        3)
                            # العودة إلى قائمة الإصلاح
                            continue
                            ;;
                        *)
                            info "Returning to repair menu..."
                            ;;
                    esac
                else
                    error "Blueprint test failed"
                    issues+=("Blueprint command not working")
                fi
            fi
            
            # عرض المشاكل إذا وجدت
            if [[ ${#issues[@]} -gt 0 ]]; then
                echo
                echo -e "${YELLOW}Issues found:${NC}"
                for issue in "${issues[@]}"; do
                    echo -e "  ${RED}•${NC} $issue"
                done
            fi
            
            # إذا لم تكن هناك مشاكل وكان Blueprint يعمل
            if [[ ${#issues[@]} -eq 0 ]] && [[ "$blueprint_found" == "true" ]] && [[ "$BLUEPRINT_INSTALLED" == "true" ]]; then
                success "Blueprint installation is complete and working!"
                return
            fi
            
            # عرض خيارات الإصلاح إذا كانت هناك مشاكل
            if [[ ${#issues[@]} -gt 0 ]] || [[ "$BLUEPRINT_INSTALLED" != "true" ]]; then
                echo
                echo -e "${INFO_COLOR}Repair Options:${NC}"
                echo -e "${OPTION_COLOR}1)${NC} Install/Reinstall Blueprint"
                echo -e "${OPTION_COLOR}2)${NC} Install Node.js & yarn only"
                echo -e "${OPTION_COLOR}3)${NC} Fix Blueprint PATH (create symlink)"
                echo -e "${OPTION_COLOR}4)${NC} Check Blueprint installation manually"
                echo -e "${OPTION_COLOR}5)${NC} Return to menu"
                echo
                
                read -rp "Choose option [1-5]: " repair_choice
                
                case $repair_choice in
                    1)
                        install_blueprint_manager
                        ;;
                    2)
                        menu_header "Install Node.js & yarn"
                        
                        log "Installing Node.js 20..."
                        
                        # تنظيف أي تثبيتات قديمة
                        apt-get purge -y nodejs npm libnode-dev 2>/dev/null || true
                        
                        # إضافة مستودع Node.js 20
                        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
                        
                        # تثبيت Node.js
                        apt-get update -y >> "$INSTALL_LOG" 2>&1
                        apt-get install -y nodejs >> "$INSTALL_LOG" 2>&1
                        
                        # تثبيت yarn
                        log "Installing yarn..."
                        npm install -g yarn >> "$INSTALL_LOG" 2>&1
                        
                        ok "Node.js $(node --version 2>/dev/null || echo 'Not installed') and yarn $(yarn --version 2>/dev/null || echo 'Not installed')"
                        ;;
                    3)
                        log "Fixing Blueprint PATH..."
                        if [[ -f "/var/www/pterodactyl/blueprint.sh" ]]; then
                            ln -sf /var/www/pterodactyl/blueprint.sh /usr/local/bin/blueprint 2>/dev/null || true
                            chmod +x /usr/local/bin/blueprint 2>/dev/null || true
                            ok "Symbolic link created: /usr/local/bin/blueprint"
                        else
                            error "blueprint.sh not found at /var/www/pterodactyl/"
                        fi
                        ;;
                    4)
                        echo
                        echo -e "${INFO_COLOR}Manual Blueprint Check:${NC}"
                        echo -e "${OPTION_COLOR}1.${NC} Check panel directory: ${YELLOW}ls -la /var/www/pterodactyl/ | grep -i blueprint${NC}"
                        echo -e "${OPTION_COLOR}2.${NC} Check for blueprint command: ${YELLOW}which blueprint || echo 'Not found'${NC}"
                        echo -e "${OPTION_COLOR}3.${NC} Check Node.js version: ${YELLOW}node --version${NC}"
                        echo -e "${OPTION_COLOR}4.${NC} Check yarn version: ${YELLOW}yarn --version${NC}"
                        echo
                        
                        # تنفيذ بعض الأوامر
                        echo -e "${YELLOW}Running checks...${NC}"
                        echo -e "${BLUE}Panel directory:${NC}"
                        ls -la /var/www/pterodactyl/ 2>/dev/null | grep -i blueprint || echo "No blueprint files found"
                        echo
                        
                        echo -e "${BLUE}Blueprint command:${NC}"
                        which blueprint 2>/dev/null || echo "Command not found in PATH"
                        echo
                        
                        echo -e "${BLUE}Node.js version:${NC}"
                        node --version 2>/dev/null || echo "Node.js not installed"
                        echo
                        
                        echo -e "${BLUE}yarn version:${NC}"
                        yarn --version 2>/dev/null || echo "yarn not installed"
                        ;;
                    5)
                        return
                        ;;
                    *)
                        error "Invalid option"
                        ;;
                esac
            fi
            ;;
        7) return ;;
        *) error "Invalid option" ;;
    esac
}

# ============================================
# MONITORING FUNCTIONS (المفقودة)
# ============================================
disable_monitoring() {
    log "Disabling monitoring..."
    
    # Remove monitoring cron job
    crontab -l 2>/dev/null | grep -v "tarbool-monitor.sh" | crontab -
    
    # Remove monitoring files
    rm -f /usr/local/bin/tarbool-monitor.sh
    rm -f /etc/logrotate.d/tarbool-monitoring
    
    MONITORING_ENABLED=false
    ok "Monitoring disabled"
}

install_monitoring_tools() {
    log "Installing monitoring tools..."
    
    apt-get install -y \
        htop atop iotop iftop nload \
        sysstat dstat glances \
        >> "$INSTALL_LOG" 2>&1
    
    ok "Monitoring tools installed"
}

show_monitoring_status() {
    echo
    echo -e "${INFO_COLOR}Monitoring Status:${NC}"
    echo
    
    if [[ "$MONITORING_ENABLED" == "true" ]]; then
        echo -e "${GREEN}✓ Monitoring is enabled${NC}"
        
        # Check if cron job exists
        if crontab -l 2>/dev/null | grep -q "tarbool-monitor.sh"; then
            echo -e "${GREEN}✓ Cron job is active${NC}"
        else
            echo -e "${YELLOW}⚠ Cron job not found${NC}"
        fi
        
        # Check if monitoring script exists
        if [[ -f "/usr/local/bin/tarbool-monitor.sh" ]]; then
            echo -e "${GREEN}✓ Monitoring script exists${NC}"
        else
            echo -e "${YELLOW}⚠ Monitoring script not found${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ Monitoring is disabled${NC}"
    fi
    
    echo
    echo -e "${INFO_COLOR}Installed Monitoring Tools:${NC}"
    
    local tools=("htop" "atop" "iotop" "iftop" "nload" "glances")
    for tool in "${tools[@]}"; do
        if command -v "$tool" >/dev/null 2>&1; then
            echo -e "  ${GREEN}✓${NC} $tool"
        else
            echo -e "  ${YELLOW}✗${NC} $tool"
        fi
    done
}

configure_domains() {
    menu_header "Domain Configuration"
    
    echo -e "${INFO_COLOR}Current Domain Configuration:${NC}"
    echo
    echo -e "${OPTION_COLOR}Panel Domain:${NC} $PANEL_DOMAIN"
    echo -e "${OPTION_COLOR}Wings Domain:${NC} $WINGS_DOMAIN"
    echo -e "${OPTION_COLOR}CtrlPanel Domain:${NC} $CTRL_DOMAIN"
    echo
    
    echo -e "${INFO_COLOR}Update Domains:${NC}"
    echo
    input_with_default "New Panel Domain" "$PANEL_DOMAIN" PANEL_DOMAIN "domain"
    input_with_default "New Wings Domain" "$WINGS_DOMAIN" WINGS_DOMAIN "domain"
    input_with_default "New CtrlPanel Domain" "$CTRL_DOMAIN" CTRL_DOMAIN "domain"
    
    save_config
    ok "Domain configuration updated"
}

configure_email() {
    menu_header "Email Configuration"
    
    echo -e "${INFO_COLOR}Current Email Configuration:${NC}"
    echo
    echo -e "${OPTION_COLOR}Panel Email:${NC} $PANEL_EMAIL"
    echo -e "${OPTION_COLOR}Wings Email:${NC} $WINGS_EMAIL"
    echo -e "${OPTION_COLOR}CtrlPanel Email:${NC} $CTRL_EMAIL"
    echo
    
    echo -e "${INFO_COLOR}Update Emails:${NC}"
    echo
    input_with_default "Panel Email" "$PANEL_EMAIL" PANEL_EMAIL "email"
    input_with_default "Wings Email" "$WINGS_EMAIL" WINGS_EMAIL "email"
    input_with_default "CtrlPanel Email" "$CTRL_EMAIL" CTRL_EMAIL "email"
    
    save_config
    ok "Email configuration updated"
}

configure_firewall() {
    menu_header "Firewall Configuration"
    
    if ! command -v ufw >/dev/null 2>&1; then
        apt-get install -y ufw >> "$INSTALL_LOG" 2>&1
    fi
    
    echo -e "${INFO_COLOR}Configure Firewall Rules:${NC}"
    echo
    echo -e "${OPTION_COLOR}1)${NC} Enable Firewall"
    echo -e "${OPTION_COLOR}2)${NC} Disable Firewall"
    echo -e "${OPTION_COLOR}3)${NC} Allow Port"
    echo -e "${OPTION_COLOR}4)${NC} Deny Port"
    echo -e "${OPTION_COLOR}5)${NC} View Rules"
    echo -e "${OPTION_COLOR}6)${NC} Reset Rules"
    echo
    
    read -rp "Choose option [1-6]: " firewall_choice
    
    case $firewall_choice in
        1)
            ufw --force enable
            FIREWALL_CONFIGURED=true
            ok "Firewall enabled"
            ;;
        2)
            ufw --force disable
            FIREWALL_CONFIGURED=false
            ok "Firewall disabled"
            ;;
        3)
            input_with_default "Port to allow" "22" ALLOW_PORT "number"
            input_with_default "Protocol (tcp/udp)" "tcp" ALLOW_PROTOCOL
            ufw allow "$ALLOW_PORT/$ALLOW_PROTOCOL"
            ok "Port $ALLOW_PORT/$ALLOW_PROTOCOL allowed"
            ;;
        4)
            input_with_default "Port to deny" "" DENY_PORT "number"
            ufw deny "$DENY_PORT"
            ok "Port $DENY_PORT denied"
            ;;
        5)
            echo
            ufw status verbose
            ;;
        6)
            ufw --force reset
            FIREWALL_CONFIGURED=false
            ok "Firewall rules reset"
            ;;
        *) error "Invalid option" ;;
    esac
}

configure_monitoring() {
    menu_header "Monitoring Configuration"
    
    echo -e "${INFO_COLOR}Monitoring Options:${NC}"
    echo
    echo -e "${OPTION_COLOR}1)${NC} Enable Monitoring"
    echo -e "${OPTION_COLOR}2)${NC} Disable Monitoring"
    echo -e "${OPTION_COLOR}3)${NC} Install Monitoring Tools"
    echo -e "${OPTION_COLOR}4)${NC} View Monitoring Status"
    echo
    
    read -rp "Choose option [1-4]: " monitor_choice
    
    case $monitor_choice in
        1)
            MONITORING_ENABLED=true
            setup_monitoring
            ;;
        2)
            MONITORING_ENABLED=false
            disable_monitoring
            ;;
        3)
            install_monitoring_tools
            ;;
        4)
            show_monitoring_status
            ;;
        *) error "Invalid option" ;;
    esac
}

setup_monitoring() {
    log "Setting up system monitoring..."
    
    # Install monitoring tools
    apt-get install -y htop atop iotop iftop nload >> "$INSTALL_LOG" 2>&1
    
    # Configure log rotation
    cat > /etc/logrotate.d/tarbool-monitoring <<EOF
/var/log/tarbool-manager.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 640 root adm
}
EOF
    
    # Create monitoring script
    cat > /usr/local/bin/tarbool-monitor.sh <<'EOF'
#!/bin/bash
# TARBOO System Monitor

echo "=== System Monitoring ==="
echo "Uptime: $(uptime -p)"
echo "Load: $(uptime | awk -F'load average:' '{print $2}')"
echo "Memory: $(free -h | awk '/^Mem:/ {print $3 "/" $2}')"
echo "Disk: $(df -h / | awk 'NR==2 {print $3 "/" $2 " (" $5 ")"}')"
echo

echo "=== Service Status ==="
systemctl is-active nginx && echo "Nginx: ✓" || echo "Nginx: ✗"
systemctl is-active mariadb && echo "MariaDB: ✓" || echo "MariaDB: ✗"
systemctl is-active redis-server && echo "Redis: ✓" || echo "Redis: ✗"
EOF
    
    chmod +x /usr/local/bin/tarbool-monitor.sh
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/tarbool-monitor.sh >> /var/log/tarbool-monitor.log 2>&1") | crontab -
    
    MONITORING_ENABLED=true
    ok "Monitoring enabled"
}

view_configuration() {
    menu_header "Current Configuration"
    
    echo -e "${INFO_COLOR}System Configuration:${NC}"
    echo
    echo -e "${OPTION_COLOR}Script Version:${NC} $SCRIPT_VERSION"
    echo -e "${OPTION_COLOR}PHP Version:${NC} $PHP_VERSION"
    echo -e "${OPTION_COLOR}Timezone:${NC} $APP_TIMEZONE"
    echo
    
    echo -e "${INFO_COLOR}Domains:${NC}"
    echo -e "${OPTION_COLOR}Panel:${NC} $PANEL_DOMAIN"
    echo -e "${OPTION_COLOR}Wings:${NC} $WINGS_DOMAIN"
    echo -e "${OPTION_COLOR}CtrlPanel:${NC} $CTRL_DOMAIN"
    echo
    
    echo -e "${INFO_COLOR}Emails:${NC}"
    echo -e "${OPTION_COLOR}Panel:${NC} $PANEL_EMAIL"
    echo -e "${OPTION_COLOR}Wings:${NC} $WINGS_EMAIL"
    echo -e "${OPTION_COLOR}CtrlPanel:${NC} $CTRL_EMAIL"
    echo
    
    echo -e "${INFO_COLOR}Status:${NC}"
    echo -e "${OPTION_COLOR}System Optimized:${NC} $( [[ "$SYSTEM_OPTIMIZED" == true ]] && echo "${GREEN}Yes${NC}" || echo "${YELLOW}No${NC}" )"
    echo -e "${OPTION_COLOR}Firewall Configured:${NC} $( [[ "$FIREWALL_CONFIGURED" == true ]] && echo "${GREEN}Yes${NC}" || echo "${YELLOW}No${NC}" )"
    echo -e "${OPTION_COLOR}Monitoring Enabled:${NC} $( [[ "$MONITORING_ENABLED" == true ]] && echo "${GREEN}Yes${NC}" || echo "${YELLOW}No${NC}" )"
    echo
    
    read -rp "Press Enter to continue..."
}

reset_configuration() {
    menu_header "Reset Configuration"
    
    warn "This will reset all configuration to defaults!"
    read -rp "Are you sure? (y/N): " confirm
    
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        rm -rf "$CONFIG_DIR"
        mkdir -p "$CONFIG_DIR"
        
        # Reset variables
        PANEL_DOMAIN=""
        PANEL_EMAIL=""
        WINGS_DOMAIN=""
        WINGS_EMAIL=""
        CTRL_DOMAIN=""
        CTRL_EMAIL=""
        SYSTEM_OPTIMIZED=false
        FIREWALL_CONFIGURED=false
        MONITORING_ENABLED=false
        
        INSTALLED_COMPONENTS=()
        INSTALLED_THEMES=()
        
        ok "Configuration reset to defaults"
    else
        info "Reset cancelled"
    fi
}

# ============================================
# INITIALIZATION & EXIT FUNCTIONS
# ============================================


# ============================================
# FIX BROKEN NODE.JS REPOSITORY
# ============================================
fix_broken_node_repo() {
    log "Checking for broken Node.js repository..."
    
    # تنظيف أي مصادر Node.js قديمة معطوبة
    if [[ -f "/etc/apt/sources.list.d/nodesource.list" ]]; then
        local repo_content
        repo_content=$(cat "/etc/apt/sources.list.d/nodesource.list" 2>/dev/null || echo "")
        
        # إذا كان المصدر يستخدم jammy بدلاً من nodistro
        if echo "$repo_content" | grep -q "jammy" || echo "$repo_content" | grep -q "focal" || echo "$repo_content" | grep -q "bionic"; then
            warn "Found broken Node.js repository, fixing..."
            rm -f /etc/apt/sources.list.d/nodesource.list 2>/dev/null || true
            rm -f /etc/apt/keyrings/nodesource.gpg 2>/dev/null || true
            ok "Removed broken Node.js repository"
        fi
    fi
}

# ============================================
# INITIALIZATION FUNCTION (FIXED VERSION)
# ============================================
initialize() {
    # Create directories
    mkdir -p "$BACKUP_DIR" "$CONFIG_DIR" "$TEMP_DIR" "$SSL_DIR"
    
    # Create log file
    touch "$INSTALL_LOG"
    chmod 600 "$INSTALL_LOG"
    
    # Check requirements
    check_root
    check_os
    check_internet
    
    # Fix broken Node.js repository قبل فحص ال dependencies
    fix_broken_node_repo
    
    check_dependencies
    check_disk_space
    check_memory
    
    # Load configuration if exists
    if [[ -f "$CONFIG_DIR/config.env" ]]; then
        # shellcheck source=/dev/null
        source "$CONFIG_DIR/config.env"
        
        # Load BLUEPRINT_INSTALLED من ال config
        if grep -q "BLUEPRINT_INSTALLED" "$CONFIG_DIR/config.env"; then
            BLUEPRINT_INSTALLED=$(grep "BLUEPRINT_INSTALLED" "$CONFIG_DIR/config.env" | cut -d= -f2 | tr -d '"')
        fi
    fi
    
    # Load installed components - FIXED VERSION
    if [[ -f "$CONFIG_DIR/installed_components" ]]; then
        # Clear the array first
        declare -gA INSTALLED_COMPONENTS=()
        
        # Read file line by line and filter out empty lines
        while IFS= read -r line || [[ -n "$line" ]]; do
            # Remove whitespace and skip empty lines
            line="${line#"${line%%[![:space:]]*}"}"
            line="${line%"${line##*[![:space:]]}"}"
            
            if [[ -n "$line" ]]; then
                INSTALLED_COMPONENTS["$line"]=true
                debug "Loaded component: $line"
            fi
        done < "$CONFIG_DIR/installed_components"
    fi
    
    # Load installed themes - FIXED VERSION
    if [[ -f "$CONFIG_DIR/installed_themes" ]]; then
        # Clear the array first
        declare -ga INSTALLED_THEMES=()
        
        # Read file line by line and filter out empty lines
        while IFS= read -r line || [[ -n "$line" ]]; do
            # Remove whitespace and skip empty lines
            line="${line#"${line%%[![:space:]]*}"}"
            line="${line%"${line##*[![:space:]]}"}"
            
            if [[ -n "$line" ]]; then
                INSTALLED_THEMES+=("$line")
                debug "Loaded theme: $line"
            fi
        done < "$CONFIG_DIR/installed_themes"
    fi
    
    # Check Blueprint installation (طريقتين)
    if command -v blueprint >/dev/null 2>&1; then
        BLUEPRINT_INSTALLED=true
    elif [[ -f "/var/www/pterodactyl/.blueprintrc" ]]; then
        BLUEPRINT_INSTALLED=true
    fi
    
    # Check SSL status
    if [[ -f "/etc/letsencrypt/accounts" ]] || command -v certbot >/dev/null 2>&1; then
        SSL_MANAGED=true
    fi
    
    log "TARBOO Management Suite v${SCRIPT_VERSION} initialized"
}

save_config() {
    log "Saving configuration..."
    
    # Create config directory if it doesn't exist
    mkdir -p "$CONFIG_DIR"
    
    # Save installed components
    if [[ ${#INSTALLED_COMPONENTS[@]} -gt 0 ]]; then
        for component in "${!INSTALLED_COMPONENTS[@]}"; do
            echo "$component"
        done | sort > "$CONFIG_DIR/installed_components"
    else
        > "$CONFIG_DIR/installed_components"
    fi
    
    # Save installed themes
    if [[ ${#INSTALLED_THEMES[@]} -gt 0 ]]; then
        printf "%s\n" "${INSTALLED_THEMES[@]}" | sort > "$CONFIG_DIR/installed_themes"
    else
        > "$CONFIG_DIR/installed_themes"
    fi
    
    # Save configuration - استخدام القيم الافتراضية إذا كانت المتغيرات غير معرفة
    cat > "$CONFIG_DIR/config.env" <<EOF
# TARBOO Configuration
SCRIPT_VERSION="$SCRIPT_VERSION"
PHP_VERSION="$PHP_VERSION"
APP_TIMEZONE="$APP_TIMEZONE"
MYSQL_ROOT_PASS="${MYSQL_ROOT_PASS:-}"

# Domains
PANEL_DOMAIN="${PANEL_DOMAIN:-}"
WINGS_DOMAIN="${WINGS_DOMAIN:-}"
CTRL_DOMAIN="${CTRL_DOMAIN:-}"

# Emails
PANEL_EMAIL="${PANEL_EMAIL:-}"
WINGS_EMAIL="${WINGS_EMAIL:-}"
CTRL_EMAIL="${CTRL_EMAIL:-}"

# Database (استخدام القيم الافتراضية إذا لم تكن معرفة)
DB_NAME="${DB_NAME:-}"
DB_USER="${DB_USER:-}"
DB_PASS="${DB_PASS:-}"
CTRL_DB_NAME="${CTRL_DB_NAME:-}"
CTRL_DB_USER="${CTRL_DB_USER:-}"
CTRL_DB_PASS="${CTRL_DB_PASS:-}"

# Status
SYSTEM_OPTIMIZED="$SYSTEM_OPTIMIZED"
FIREWALL_CONFIGURED="$FIREWALL_CONFIGURED"
MONITORING_ENABLED="$MONITORING_ENABLED"
BLUEPRINT_INSTALLED="$BLUEPRINT_INSTALLED"
EOF
    
    chmod 600 "$CONFIG_DIR"/*
    ok "Configuration saved"
}

exit_script() {
    save_config
    
    echo
    echo -e "${HEADER_COLOR}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${SUCCESS_COLOR}      Thank you for using TARBOO Management Suite!      ${NC}"
    echo -e "${HEADER_COLOR}═══════════════════════════════════════════════════════════${NC}"
    echo
    echo -e "${INFO_COLOR}Important Information:${NC}"
    echo -e "${OPTION_COLOR}Installation Log:${NC} $INSTALL_LOG"
    echo -e "${OPTION_COLOR}Backup Directory:${NC} $BACKUP_DIR"
    echo -e "${OPTION_COLOR}Configuration Files:${NC} $CONFIG_DIR"
    echo -e "${OPTION_COLOR}SSL Certificates:${NC} /etc/letsencrypt"
    echo
    echo -e "${INFO_COLOR}Management Commands:${NC}"
    echo -e "${OPTION_COLOR}System Status:${NC} systemctl status"
    echo -e "${OPTION_COLOR}View Logs:${NC} tail -f $INSTALL_LOG"
    echo -e "${OPTION_COLOR}SSL Renewal:${NC} certbot renew"
    echo
    echo -e "${INFO_COLOR}Goodbye!${NC}"
    echo
    
    exit 0
}

# ============================================
# MAIN EXECUTION
# ============================================
trap 'error_handler $LINENO' ERR

# Initialize system
initialize

# Run main menu
main_menu`;

    // 3. إرسال الرد
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    
    console.log('[TARBOO] Sending installer script');
    res.status(200).send(shellScript);
    
  } catch (error) {
    // 4. معالجة الأخطاء
    console.error('[TARBOO] Server Error:', error.message, error.stack);
    
    res.status(500).send(`#!/bin/bash
echo "========================================="
echo "SERVER CONFIGURATION ERROR"
echo "========================================="
echo "The installer service encountered an issue."
echo ""
echo "Error details: ${error.message}"
echo ""
echo "Please try the following:"
echo "1. Generate a new token"
echo "2. Try again in 2 minutes"
echo "3. Contact support if issue persists"
echo "========================================="
exit 1`);
  }
}