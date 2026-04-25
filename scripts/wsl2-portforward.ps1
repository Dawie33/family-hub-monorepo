# À exécuter en tant qu'Administrateur au démarrage de Windows
# Crée une tâche planifiée : Gestionnaire de tâches > Créer une tâche > Au démarrage > Exécuter en tant qu'admin

$wslIp = (wsl hostname -I).Trim().Split()[0]
$ports = @(80, 443)

Write-Host "WSL2 IP: $wslIp"

foreach ($port in $ports) {
    # Toutes interfaces (LAN, Tailscale...)
    netsh interface portproxy delete v4tov4 listenport=$port listenaddress=0.0.0.0 2>$null
    netsh interface portproxy add v4tov4 listenport=$port listenaddress=0.0.0.0 connectport=$port connectaddress=$wslIp
    # Loopback (nécessaire pour Tailscale Funnel qui connecte sur 127.0.0.1)
    netsh interface portproxy delete v4tov4 listenport=$port listenaddress=127.0.0.1 2>$null
    netsh interface portproxy add v4tov4 listenport=$port listenaddress=127.0.0.1 connectport=$port connectaddress=$wslIp
    Write-Host "Port $port -> WSL2:${wslIp}:$port"
}

# Règles firewall
netsh advfirewall firewall delete rule name="WSL2-TrainingCamp-HTTP" 2>$null
netsh advfirewall firewall delete rule name="WSL2-TrainingCamp-HTTPS" 2>$null
netsh advfirewall firewall add rule name="WSL2-TrainingCamp-HTTP" dir=in action=allow protocol=TCP localport=80
netsh advfirewall firewall add rule name="WSL2-TrainingCamp-HTTPS" dir=in action=allow protocol=TCP localport=443

Write-Host "Port forwarding configuré."
