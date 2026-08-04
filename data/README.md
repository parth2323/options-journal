# /data — Drop Your CSV Files Here

This folder is where the Options Journal reads and writes all data.

## Files

| File | Description |
|---|---|
| `Accounts.csv` | ← **Drop your Notion Accounts export here** |
| `Trade_Journal.csv` | ← **Drop your Notion Trade Journal export here** |
| `db.json` | Auto-generated local database (do not edit manually) |

## After dropping CSVs

Run the import script from the project root:

```bash
npx tsx scripts/import-csv.ts
```

This will parse your Notion CSVs and populate `db.json` with all your accounts and trades.
The app will then show all your historical data immediately on refresh.

## Notes
- `db.json` is the source of truth while in local mode
- All edits via the UI write directly to `db.json`
- When you switch to Supabase later, only the API routes need to change
