# COMPLETE SETUP GUIDE FOR NEXTGEN AI COACH
## Written for absolute beginners (like explaining to a 5-year-old who has never used a computer)

Hello! This guide will walk you through EVERY single step, one tiny thing at a time. 
Do not skip any step. Do exactly what it says.

---

## STEP 0: What You Need Before Starting

You need these things on your computer:
- A Windows, Mac, or Chromebook computer
- Internet connection
- Google Chrome or Microsoft Edge browser (best)
- A folder where you can save files (like "Downloads" or "Documents")

You do NOT need to be good with computers. I will tell you exactly what to type and click.

---

## STEP 1: Download the App Files

1. Look at this chat.
2. There is a folder called `nextgen-ai-coach` in the files I gave you.
3. Download that entire folder to your computer (put it on your Desktop or in Documents).
4. Double-click the folder to open it. You should see files like:
   - package.json
   - app folder
   - lib folder
   - COMPLETE_SETUP_GUIDE.md (this file)
   - etc.

If you see those files, you are good.

---

## STEP 2: Install Node.js (This is like installing a helper program)

This is the most important first step.

1. Open your web browser (Chrome or Edge).
2. Go to this website by typing exactly this in the top bar and pressing Enter:
   https://nodejs.org
3. You will see two big green buttons. Click the one that says **LTS** (it is the safer one).
4. The file will download. It will be called something like `node-v20...msi` (on Windows) or `.pkg` (on Mac).
5. When it finishes downloading, double-click the downloaded file to open it.
6. A window will pop up. Keep clicking "Next" or "Continue" and "Install" until it finishes. 
   - On Windows: You may need to click "Yes" if it asks for permission.
7. When it says "Successfully installed", click Finish.
8. Restart your computer (turn it off and on again). This is important.

**How to check if it worked:**
- Open a new terminal / command prompt:
  - On Windows: Press Windows key, type "Command Prompt", press Enter.
  - On Mac: Press Command + Space, type "Terminal", press Enter.
- In the black window that opens, type exactly this and press Enter:
  ```
  node --version
  ```
- You should see something like `v20.12.0` or higher. If you see numbers, great! Node is installed.

---

## STEP 3: Open the Project Folder in Terminal

1. Open Terminal or Command Prompt again (like in Step 2).
2. Type exactly this and press Enter (this goes to your Desktop):
   ```
   cd Desktop
   ```
   (If you saved the folder somewhere else, go to that location instead.)

3. Now type this and press Enter (this opens the project folder):
   ```
   cd nextgen-ai-coach
   ```

You should now be inside the project folder.

---

## STEP 4: Install All the Needed Programs (One Command)

In the same black terminal window, type this exact line and press Enter:

```
npm install
```

This will take 1–3 minutes. You will see lots of text scrolling. 
**Do not close the window.** Just wait until you see the cursor blinking again and it says something like "added X packages".

If it finishes without red error messages, you are good.

---

## STEP 5: Create Your Free Supabase Account (This saves your members' data)

This is where the app will store member sessions and training plans.

1. Open your browser again.
2. Go to: https://supabase.com
3. Click the big green button that says **"Start your project"** or **"Sign up"**.
4. Sign up using your Google account (easiest) or email.
5. After you log in, click **"New Project"**.
6. Fill in:
   - Name: `nextgen-ai-coach`
   - Database Password: Type a password you will remember (write it down somewhere safe)
   - Region: Choose the one closest to South Carolina (us-east-1 or similar)
7. Click **"Create new project"**. Wait 1–2 minutes until it says the project is ready.

---

## STEP 6: Get Your Supabase Keys

1. In Supabase, on the left menu, click **"Project Settings"** (gear icon at the bottom).
2. Click **"API"** in the menu.
3. You will see two important things:
   - **Project URL** (starts with https://...)
   - **anon public** key (a long string starting with `eyJ...`)
4. Copy both of these somewhere (you can paste them into a note).

---

## STEP 7: Add the Keys to Your App

1. Go back to your project folder on your computer.
2. Inside the `nextgen-ai-coach` folder, look for a file called `.env.example`.
3. Make a copy of it and rename the copy to `.env.local` (important: it must be exactly `.env.local`).
4. Open the new `.env.local` file with Notepad (Windows) or TextEdit (Mac).
5. You will see lines like:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
6. Replace `your-project-url` with the Project URL you copied from Supabase.
7. Replace `your-anon-key` with the anon public key you copied.
8. Save the file and close it.

---

## STEP 8: Set Up the Database Tables

1. Go back to your Supabase website.
2. On the left menu, click **"SQL Editor"**.
3. Click **"New query"**.
4. Now go back to your computer and open the file called `supabase/schema.sql` (inside the nextgen-ai-coach folder).
5. Select everything in that file (Ctrl+A or Command+A) and copy it.
6. Paste it into the SQL Editor box in Supabase.
7. Click the big green **"Run"** button at the bottom right.
8. You should see a success message. The database tables are now created.

---

## STEP 9: Run the App!

1. Go back to your Terminal / Command Prompt window (the black one).
2. Make sure you are still in the `nextgen-ai-coach` folder.
3. Type this exact command and press Enter:

```
npm run dev
```

4. You will see text. Look for a line that says something like:
   ```
   Local: http://localhost:3000
   ```
5. Open your web browser and go to: http://localhost:3000

**You should now see the NextGen AI Coach app with your logo!**

---

## STEP 10: Test It Like a Member Would

1. On the home screen, click any **Bay** button (for example Bay 3).
2. Click the big button to record a video (it will let you choose a video file from your computer for testing).
3. Download a sample GSPro CSV file (I can give you one if you ask) or use any CSV you have.
4. Upload the CSV.
5. Click **"Analyze Session & Generate Plan"**.
6. You should see a swing score, feedback, and a training plan with checkable drills.

Congratulations! The app is working.

---

## STEP 11: Make It Live on the Internet (Optional but Recommended)

If you want your members to use it from their phones without running it on your computer:

1. Go to https://vercel.com and sign up with GitHub (free).
2. Click **"Add New Project"**.
3. Import the `nextgen-ai-coach` folder from your GitHub (or drag and drop).
4. Add the same two environment variables from Step 7.
5. Click Deploy.
6. When it finishes, you will get a link like `https://nextgen-ai-coach.vercel.app`

Send that link to your members. They can open it on their phones and install it like an app.

---

## IMPORTANT NOTES

- The first time you run it, it uses "demo mode". Real saving to Supabase will work after you complete Steps 5–8.
- To make the video recording better and add real pose analysis, tell me and I will upgrade it.
- The auto GSPro bridge script is in the `bridge` folder. I will explain how to use it in a separate message if you want.

---

You did it! 

If anything goes wrong at any step, take a screenshot or copy the exact error message and send it to me. I will tell you exactly how to fix it.

Now go hit some balls while I keep improving the app even more. 

Just reply with what you want next (more polish, the bridge script running instructions, better AI, etc.).

---

**Created with care for NextGen Golf Lounge**