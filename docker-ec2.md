# Desplegar pmng en EC2

IP pública: `3.238.125.54`.

El front se abre en el puerto 80. El navegador llama al API en el puerto 8089. MySQL solo se ve dentro de la red de Compose (`pmng-mysql`).

En el security group abre **22**, **80** y **8089**.

## 1. Instalar Docker en el EC2

Amazon Linux 2023, usuario `ec2-user`.

```bash
ssh -i tu-llave.pem ec2-user@3.238.125.54
```

```bash
sudo dnf update -y
sudo dnf install -y docker
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
sudo mkdir -p /usr/libexec/docker/cli-plugins
sudo curl -SL "https://github.com/docker/compose/releases/download/v2.40.3/docker-compose-linux-$(uname -m)" -o /usr/libexec/docker/cli-plugins/docker-compose
sudo chmod +x /usr/libexec/docker/cli-plugins/docker-compose
```

Cierra la sesión y vuelve a entrar para que el grupo `docker` aplique:

```bash
exit
ssh -i tu-llave.pem ec2-user@3.238.125.54
docker compose version
```

## 2. Subir el proyecto

Desde la carpeta `pmng` en tu máquina. No subas `service/target`, `.idea`, `client/node_modules` ni `client/dist`.

```bash
rsync -avz -e "ssh -i tu-llave.pem" \
  --exclude 'service/target' \
  --exclude '.idea' \
  --exclude 'client/node_modules' \
  --exclude 'client/dist' \
  ./ ec2-user@3.238.125.54:~/pmng/
```

Si no tienes `rsync`:

```bash
ssh -i tu-llave.pem ec2-user@3.238.125.54 "mkdir -p ~/pmng"
scp -i tu-llave.pem docker-compose.yml docker-ec2.md ec2-user@3.238.125.54:~/pmng/
scp -i tu-llave.pem -r client service ec2-user@3.238.125.54:~/pmng/
```

Con `scp`, borra en el EC2 lo que no hace falta para el build:

```bash
ssh -i tu-llave.pem ec2-user@3.238.125.54 "rm -rf ~/pmng/service/target ~/pmng/client/node_modules ~/pmng/client/dist ~/pmng/.idea"
```

## 3. Levantar Compose

En el EC2:

```bash
cd ~/pmng
docker compose up -d --build
```

La primera vez tarda: Maven descarga dependencias y Node construye el front. MySQL tiene que quedar healthy antes de que arranque el API.

## 4. Comprobar

En el EC2:

```bash
docker compose ps
curl -sS http://localhost:8089/people
```

La respuesta inicial es `[]`.

Alta de una persona:

```bash
curl -sS -X POST http://localhost:8089/people \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ana"}'
curl -sS http://localhost:8089/people
```

Desde el navegador:

- Front: `http://3.238.125.54`
- API: `http://3.238.125.54:8089/people`

El front lee `config.json`, cambia `ip_publica` por el hostname de la página y llama a `http://3.238.125.54:8089/people`. Escribe un nombre, pulsa **enviar** y el nombre debe aparecer en la lista y en el JSON del API.

## 5. Parar

```bash
cd ~/pmng
docker compose down
```

`docker compose down -v` borra también los datos de MySQL.
