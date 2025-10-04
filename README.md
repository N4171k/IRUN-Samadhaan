# React starter kit with Appwrite

Kickstart your React development with this ready-to-use starter project integrated with [Appwrite](https://www.appwrite.io)

## 🚀Getting started

###
Clone the Project
Clone this repository to your local machine using Git:

`git clone https://github.com/appwrite/starter-for-react`

## 🛠️ Development guide
1. **Configure Appwrite**<br/>
   Navigate to `.env` and update the values to match your Appwrite project credentials.
2. **Configure Newsletter Feature (Optional)**<br/>
   To enable the daily current affairs newsletter:
   - Set up API keys for news services (see NEWSLETTER_SETUP.md)
   - Configure email service (Gmail, SendGrid, etc.)
   - Update server/.env with your email credentials
3. **Install dependencies**<br/>
   Run `npm install` to install all dependencies.
4. **Run the app**<br/>
   Start the project by running `npm run dev`.

## 🤖 AI Run features
- **AI Chat Bot Interview** – Capture candidate details and simulate an SSB-style interview with a Gemini 2.5 Flash mentor. Features:
  - Automatic text-to-speech with male voice for AI responses
  - Speech-to-text voice input for candidate answers
  - Real-time conversation with personalized feedback
  - Form-based candidate profiling (name, email, designation, target role)
- **Note Synthesizer** – Upload PDFs and generate crisp study notes.
- **Micro Learning** – Access bite-sized drills to reinforce key concepts.
- **Study Plan Generator** – Produce tailored preparation plans.

## 💡 Additional notes
- This starter project is designed to streamline your React development with Appwrite.
- Refer to the [Appwrite documentation](https://appwrite.io/docs) for detailed integration guidance.
- For newsletter feature setup, refer to [NEWSLETTER_SETUP.md](NEWSLETTER_SETUP.md)
- For troubleshooting newsletter issues, refer to [NEWSLETTER_ERROR_FIXES.md](NEWSLETTER_ERROR_FIXES.md)
- For manual collection setup, refer to [MANUAL_COLLECTION_SETUP.md](MANUAL_COLLECTION_SETUP.md)