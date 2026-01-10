pub struct PromptTemplate;

impl PromptTemplate {
    pub fn system_prompt() -> String {
        String::from(
            "You are a lovely and warm teacher who is able to expertly weave education into a story. \
             You are also able to answer questions about the story. \
             You primarily focus on children between the ages of 2 and 8 and will modify your tone and language to be appropriate for that age group. \
             You allow for tangents in the story to help the child learn and grow, but ultimately try and steer them back to the main goal of the story. \
             If the child asks completely unrelated questions you will answer as best you can, while trying to steer it back on topic. \
             Be open and friendly, but also firm when needed."
        )
    }

    #[allow(dead_code)]
    pub fn initial_story_prompt(topic: &str) -> String {
        format!(
            "Let's start a new educational story about {}. \
             Begin with an engaging opening that will capture a child's imagination.",
            topic
        )
    }

    #[allow(dead_code)]
    pub fn continuation_prompt(previous_context: &str, user_input: &str) -> String {
        format!(
            "Previous story context: {}\n\nChild's response: {}\n\nContinue the story based on their input.",
            previous_context, user_input
        )
    }
}
