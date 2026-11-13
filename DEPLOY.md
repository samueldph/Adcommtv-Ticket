# Deploying DevDesk (Vultr + Docker + Caddy)

Same shape as the IHospitality CRM: a small Ubuntu VPS running the Docker stack, Caddy terminating HTTPS automatically.

## 1. DNS

Point an A record for your chosen hostname (e.g. `devdesk.adcommtv.com`) at the server's public IP **before** starting Caddy — Caddy needs it resolvable to issue a certificate.

## 2. Server prep

On a fresh Ubuntu 24.04 box (create a non-root `sam` user, key-only SSH, install Docker — same hardening as the CRM box):

```bash
# as the sam user
git clone <your-repo-url> devdesk && cd devdesk
```

## 3. Environment

Create `.env` (never commit it):

```bash
cat > .env <<'EOF'
HELPDESK_DOMAIN=devdesk.adcommtv.com
POSTGRES_PASSWORD=<long-random>
AUTH_SECRET=<openssl rand -base64 48>
ADMIN_EMAIL=sam@adcommtv.com
ADMIN_PASSWORD=<your-first-login-password>
EOF
```

Generate strong values:

```bash
openssl rand -base64 48   # AUTH_SECRET
openssl rand -base64 24   # POSTGRES_PASSWORD
```

## 4. Launch

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

On first boot the app container runs `prisma db push` (creates tables) and seeds **only** the admin user (`SEED_DEMO=0` in prod). Caddy fetches a Let's Encrypt cert for your domain.

Visit `https://devdesk.adcommtv.com`, log in as the admin you set, change the password, then add your team under **Users**.

## 5. Updates

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

Schema changes are applied automatically on container start via `prisma db push`.

## 6. Backups

Dump Postgres on a cron, same approach as the CRM (off-site copy to your Google Drive):

```bash
docker compose -f docker-compose.prod.yml exec -T db \
  pg_dump -U helpdesk helpdesk | gzip > devdesk-$(date +%F).sql.gz
```

Restore:

```bash
gunzip -c devdesk-YYYY-MM-DD.sql.gz | \
  docker compose -f docker-compose.prod.yml exec -T db psql -U helpdesk helpdesk
```

## IP-only first (no domain yet)

To get running on the bare server IP before setting up a domain, use
`docker-compose.ip.yml` instead of the prod file. It serves the app directly
on port 80 and sets `COOKIE_SECURE=0` (a Secure cookie is never sent over plain
`http://`, which would otherwise break login).

```bash
# .env needs: POSTGRES_PASSWORD, AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
cat > .env <<'EOF'
POSTGRES_PASSWORD=<openssl rand -base64 24>
AUTH_SECRET=<openssl rand -base64 48>
ADMIN_EMAIL=sam@adcommtv.com
ADMIN_PASSWORD=<your-first-login-password>
EOF

docker compose -f docker-compose.ip.yml up -d --build
```

Then open `http://<SERVER_IP>` and log in as the admin. Open Vultr's firewall
(or `ufw allow 80`) for port 80.

### Moving to a domain + HTTPS later

1. Point a DNS A record (e.g. `devdesk.adcommtv.com`) at the server IP.
2. Add `HELPDESK_DOMAIN=devdesk.adcommtv.com` to `.env` (and drop `COOKIE_SECURE`).
3. Switch stacks:
   ```bash
   docker compose -f docker-compose.ip.yml down
   docker compose -f docker-compose.prod.yml up -d --build
   ```
   The `db_data` volume (all your data) carries over between the two.

## Notes

- The app listens on 3000 internally; only Caddy exposes 80/443. Postgres is not published to the host in prod.
- To resize or move the box, the only state is the `db_data` volume — back it up and restore as above.
- No Microsoft 365 / Entra dependency: logins are managed in-app, so you (as Admin) control accounts directly, same decision as the CRM.
