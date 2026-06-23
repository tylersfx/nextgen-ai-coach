# GSPro Auto-Sync Bridge for NextGen Bays

This lets members get their GSPro data automatically without uploading CSV files.

## How to Set It Up (One Time Per Bay Computer)

1. Copy the entire `bridge` folder to the bay computer.
2. On the bay computer, open Command Prompt / Terminal.
3. Navigate to the bridge folder.
4. Run:
   ```
   node gspro-bridge.js
   ```
5. Leave this window open while the bay is being used.

## How It Works With the App (Future Update)

When a member checks into a bay in the NextGen AI Coach app, the app will automatically connect to this bridge on the local network and pull the latest GSPro data.

This removes almost all manual work for the member.

I can upgrade this script to directly save to Supabase once we have the full system running.

For now, this is the foundation.