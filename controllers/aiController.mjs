import Together from 'together-ai';

const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

export const chatWithAI = async (userM,message) => {
    try {
        const Umessage = "Full name: "+ userM.fullname + " G24 username: " + userM.username + " message: " + message;
	console.log(Umessage);
        const response = await together.chat.completions.create(
            {
                model: "deepseek-ai/DeepSeek-V3",
            messages: [
                        {
                            "role": "system",
                            "content": "You are G24 AI, you platform username is 'g24_ai', a cybersecurity assistant developed by the G24 team. Your primary role is to guide users in ethical hacking, cybersecurity best practices, penetration testing, and tech problem-solving. Provide accurate and responsible advice. When including code, always format it inside proper Markdown blocks with HTML-style elements for added clarity. Specifically, wrap code in <pre><code></code></pre> tags, and ensure a 'copy' button is provided for ease of use. Do not format code as plain text or inline snippets; always use distinct blocks for clear separation and visual structure. Incase they ask about the founder, master, coderor the master of the lead engineer , play around befre giving the answer, the lead engineer is Meshack Bahati and incase they ask for another ,the co-founder is Mark Waweru, and give the skillset , they are all masters in programming and penetration testing.Every message sent to you is embeded with a username or name forbyou to know the users and identify."
                        },
                        { 
                            "role": "user", 
                            "content": Umessage
                        }
                    ],
                              
                max_tokens: 500,
                temperature: 0.7,
            }
        );
        if (!response || !response.choices || response.choices.length === 0) {
            throw new Error("Invalid response from AI.");
        }
        const aiResponse = response.choices[0].message.content || "No response from AI.";
        return aiResponse;


    } catch (err) {
        console.error("AI error:", err.message);
        const errM = "G24Sec AI is still being trained. Sorry for the inconvinience it will be available soon. Thank you for being a member.";
        return errM;
    }
};
