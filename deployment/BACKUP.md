# Backup, Disaster Recovery & Maintenance Guide

This guide covers automated daily database backups, log rotations, and disaster recovery procedures for OfficeFuel on Hostinger Shared Hosting or standard VPS environments.

---

## 1. Automated Daily MySQL Backups via Hostinger hPanel

Hostinger provides automated daily and weekly backups. To configure custom automated dumps:

1. In Hostinger hPanel, go to **Advanced** → **Cron Jobs**.
2. Add a new Cron Job to run daily at 02:00 AM:
   ```bash
   mysqldump -u u123456_ofuser -p'YourStrongPassword' u123456_officefuel | gzip > /home/u123456/backups/db_backup_$(date +\%Y\%m\%d).sql.gz
   ```
3. Create a secondary cleanup cron job to keep only the last 30 days of backups:
   ```bash
   find /home/u123456/backups -name "db_backup_*.sql.gz" -mtime +30 -exec rm {} \;
   ```

---

## 2. Manual Backup via phpMyAdmin

1. Log into **phpMyAdmin**.
2. Select database `u123456_officefuel`.
3. Click **Export** → **Custom - display all possible options**.
4. Check all tables.
5. Under Output, select **gzipped** compression.
6. Click **Go** to download the archive to your local secure drive.

---

## 3. Restoring from a Backup

To restore your database in case of disaster:

```bash
# Decompress and import
gunzip < /home/u123456/backups/db_backup_20260920.sql.gz | mysql -u u123456_ofuser -p'YourStrongPassword' u123456_officefuel
```

Or upload the `.sql` file directly in phpMyAdmin under the **Import** tab.

---

## 4. Storage & Log Maintenance

Log files are automatically created under `backend/storage/logs/`:
- `system.log`: General application flow and errors
- `audit.log`: Administrative actions (price changes, status updates, logins)
- `sms.log`: OTP and transactional SMS logs

To clean up old logs periodically:
```bash
find /path/to/backend/storage/logs/ -name "*.log" -mtime +60 -exec truncate -s 0 {} \;
```
