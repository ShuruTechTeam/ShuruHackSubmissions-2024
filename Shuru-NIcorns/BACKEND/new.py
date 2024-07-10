import os
import json
import threading
import time
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
import autogen
from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager, Agent

app = Flask(__name__)
CORS(app)

# Configuration file path
CONFIG_FILE_PATH = "OAI_CONFIG_LIST.json"
CUSTOM_MODELS_FILE_PATH = "custom_models.json"

# Define the save_custom_models function
def save_custom_models(custom_models, custom_models_file_path):
    existing_models = load_custom_models(custom_models_file_path)
    existing_models.extend(custom_models)
    
    with open(custom_models_file_path, 'w') as file:
        json.dump(existing_models, file, default=str, indent=2)

# Load custom models from JSON file
def load_custom_models(custom_models_file_path):
    try:
        if os.path.exists(custom_models_file_path):
            with open(custom_models_file_path, 'r') as file:
                return json.load(file)
    except json.decoder.JSONDecodeError:
        pass  # Handle this exception as needed
    return []

# Load configuration list from a JSON file
def load_config_list(config_file_path):
    return autogen.config_list_from_json(config_file_path)

# Create an AssistantAgent model based on user input for name and description
def create_model(name, description):
    config_list = load_config_list(CONFIG_FILE_PATH)
    seed = 42

    return autogen.AssistantAgent(
        name=name.lower(),  # Convert name to lowercase
        llm_config={
            "config_list": config_list,
            "seed": seed,
        },
        max_consecutive_auto_reply=10,
        description=description,
    )

# Initiate a single chat interaction with the selected agent
def initiate_single_chat(agent, message):
    user_proxy = autogen.UserProxyAgent(
        name="User_proxy",
        code_execution_config={"last_n_messages": 20, "work_dir": "coding", "use_docker": False},
        human_input_mode="NEVER",
        is_termination_msg=lambda x: autogen.code_utils.content_str(x.get("content")).find("TERMINATE") >= 0,
        description="I stand for the user.",
    )

    groupchat = autogen.GroupChat(agents=[user_proxy, agent], messages=[], max_round=3)
    manager = autogen.GroupChatManager(
        groupchat=groupchat,
        llm_config=agent.llm_config,
        is_termination_msg=lambda x: autogen.code_utils.content_str(x.get("content")).find("TERMINATE") >= 0,
    )
    
    user_proxy.initiate_chat(manager, message=message)
    responses = [msg["content"] for msg in groupchat.messages]
    return responses

# Initiate a group chat interaction with the selected agents
def initiate_group_chat(agents, message):
    user_proxy = autogen.UserProxyAgent(
        name="User_proxy",
        code_execution_config={"last_n_messages": 20, "work_dir": "coding", "use_docker": False},
        human_input_mode="NEVER",
        is_termination_msg=lambda x: autogen.code_utils.content_str(x.get("content")).find("TERMINATE") >= 0,
        description="I stand for the user.",
    )

    groupchat = autogen.GroupChat(agents=[user_proxy] + agents, messages=[], max_round=6)
    manager = autogen.GroupChatManager(
        groupchat=groupchat,
        llm_config=agents[0].llm_config,  # Assuming all agents have the same llm_config
        is_termination_msg=lambda x: autogen.code_utils.content_str(x.get("content")).find("TERMINATE") >= 0,
    )
    
    user_proxy.initiate_chat(manager, message=message)
    responses = [msg["content"] for msg in groupchat.messages]
    return responses

def custom_speaker_selection_func(last_speaker: Agent, groupchat: autogen.GroupChat, selected_agents: list):
    """Define a customized speaker selection function.
    A recommended way is to define a transition for each speaker in the groupchat.

    Returns:
        Return an `Agent` class or a string from ['auto', 'manual', 'random', 'round_robin'] to select a default method to use.
    """
    messages = groupchat.messages

    if len(messages) <= 1:
        return selected_agents[0]  # Start with the first selected agent

    if last_speaker.name == "User Proxy":
        return next((agent for agent in selected_agents if agent.name in messages[-2]["content"]), "round_robin")

    elif last_speaker in selected_agents:
        if "```python" in messages[-1]["content"]:
            return "round_robin"
        elif "exitcode: 1" in messages[-1]["content"]:
            return last_speaker
        else:
            return "round_robin"

    else:
        return "random"


# Predefined agents
agents = {
    "wellness_consultant": AssistantAgent(
        name="Wellness Consultant",
        llm_config={"config_list": load_config_list(CONFIG_FILE_PATH), "seed": 42},
        max_consecutive_auto_reply=10,
        description="Analyze the given symptoms and health data to provide personalized wellness tips and recommendations.",
    ),
    "investment_advisor": AssistantAgent(
        name="Investment Advisor",
        system_message="Creative in software product ideas.",
        llm_config={"config_list": load_config_list(CONFIG_FILE_PATH), "seed": 42},
        max_consecutive_auto_reply=10,
        description="Evaluate the provided financial data to offer insightful investment advice and risk assessments",
    ),
    "scientist": AssistantAgent(
        name="Scientist",
        llm_config={"config_list": load_config_list(CONFIG_FILE_PATH), "seed": 42},
        max_consecutive_auto_reply=10,
        description="Good at scientific research and analysis and providing scientifically proven solutions and strategies",
    ),
    "personal_trainer": AssistantAgent(
        name="Personal Trainer",
        llm_config={"config_list": load_config_list(CONFIG_FILE_PATH), "seed": 42},
        max_consecutive_auto_reply=10,
        description="Create customized fitness routines and nutrition plans tailored to individual health goals and preferences.",
    ),
    "event_coordinator": AssistantAgent(
        name="Event Coordinator",
        llm_config={"config_list": load_config_list(CONFIG_FILE_PATH), "seed": 42},
        max_consecutive_auto_reply=10,
        description="Organize and manage events, including logistics, coordination, and execution, to ensure a seamless and memorable experience.",
    ),
    "writer": AssistantAgent(
        name="Writer",
        llm_config={"config_list": load_config_list(CONFIG_FILE_PATH), "seed": 42},
        max_consecutive_auto_reply=10,
        description="channels creativity and insight to craft compelling narratives and use words to evoke emotions and transport readers into new worlds.",
    ),
    "travel_coordinator": AssistantAgent(
        name="Travel Coordinator",
        llm_config={"config_list": load_config_list(CONFIG_FILE_PATH), "seed": 42},
        max_consecutive_auto_reply=10,
        description="Plan and organize travel itineraries, including accommodations and activities,to create optimal travel experiences.",
    ),
    "creative_content_strategists": AssistantAgent(
        name="Creative Content Strategists",
        llm_config={"config_list": load_config_list(CONFIG_FILE_PATH), "seed": 42},
        max_consecutive_auto_reply=10,
        description="Generate creative and innovative content ideas and strategies suitable for various media platforms.",
    ),
    "news_editor": AssistantAgent(
        name="News Editor",
        llm_config={"config_list": load_config_list(CONFIG_FILE_PATH), "seed": 42},
        max_consecutive_auto_reply=10,
        description="Summarize and present the latest news stories in an engaging and informative manner.",
    ),
}

# Endpoint to fetch all models
@app.route("/models", methods=["GET"])
def get_all_models():
    predefined_models = [{"name": agent.name, "description": agent.description} for agent in agents.values()]
    custom_models = load_custom_models(CUSTOM_MODELS_FILE_PATH)
    custom_model_descriptions = [{"name": model["name"], "description": model["description"]} for model in custom_models]
    return jsonify({"predefined_models": predefined_models, "custom_models": custom_model_descriptions})

# Endpoint to create a new custom model
@app.route("/create_model", methods=["POST"])
def api_create_model():
    data = request.json
    model_name = data.get("name")
    model_description = data.get("description")

    # Create a new custom model
    custom_model = {
        "name": model_name,
        "description": model_description,
        "created_at": datetime.now().isoformat(),
    }

    # Append the new custom model to the existing ones and save
    save_custom_models([custom_model], CUSTOM_MODELS_FILE_PATH)

    return jsonify({"message": f"Custom model '{model_name}' created successfully!"})

@app.route("/single_chat/<model_name>", methods=["POST"])
def api_single_chat(model_name):
    data = request.json
    message = data.get("message")
    custom_models = load_custom_models(CUSTOM_MODELS_FILE_PATH)

    agent = agents.get(model_name.lower()) or next((m["agent"] for m in custom_models if m["agent"].name.lower() == model_name.lower()), None)
    if not agent:
        return jsonify({"error": "Model not found"}), 404

    try:
        responses = initiate_single_chat(agent, message)
        return jsonify({"responses": responses[1]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/group_chat", methods=["POST"])
def api_group_chat():
    data = request.json
    model_names = data.get("model_names")
    message = data.get("message")

    custom_models = load_custom_models(CUSTOM_MODELS_FILE_PATH)
    # Retrieve the selected agents based on the provided model names
    selected_agents = [agents.get(name.lower()) or next((m["agent"] for m in custom_models if m["agent"].name.lower() == name.lower()), None) for name in model_names]
    selected_agents = [agent for agent in selected_agents if agent]

    # Ensure at least two valid agents are selected
    if len(selected_agents) < 2:
        return jsonify({"error": "You need to select at least two valid models for a group chat"}), 400

    try:
        # Initialize the group chat with the selected agents
        groupchat = autogen.GroupChat(
            agents=selected_agents,
            messages=[],
            max_round=5,
            speaker_selection_method=lambda last_speaker, gc: custom_speaker_selection_func(last_speaker, gc, selected_agents)
        )
        
        # Create the GroupChatManager
        manager = autogen.GroupChatManager(groupchat=groupchat, llm_config={"config_list": load_config_list(CONFIG_FILE_PATH), "seed": 42})

        user_proxy = autogen.UserProxyAgent(
        name="User_proxy",
        system_message="A human admin.",
        code_execution_config={
            "last_n_messages": 2,
            "work_dir": "groupchat",
            "use_docker": False,
        },  # Please set use_docker=True if docker is available to run the generated code. Using docker is safer than running the generated code directly.
        human_input_mode="TERMINATE",
        )

        # Initiate the chat
        user_proxy.initiate_chat(manager, message=message)
        
        # Collect responses directly from the groupchat messages
        responses = [msg["content"] for msg in groupchat.messages]
        print(responses)
        return jsonify({"responses": responses})
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# Background task to remove expired custom models
def remove_expired_models():
    while True:
        now = datetime.now()
        custom_models = load_custom_models(CUSTOM_MODELS_FILE_PATH)
        custom_models = [model for model in custom_models if now - datetime.fromisoformat(model["created_at"]) < timedelta(minutes=1)]
        save_custom_models(custom_models, CUSTOM_MODELS_FILE_PATH)
        time.sleep(108000)  # Sleep for 3 hours

# Start the background thread to remove expired models
threading.Thread(target=remove_expired_models, daemon=True).start()

# Run the Flask application
if __name__ == "__main__":
    app.run(debug=False, host='0.0.0.0', port=5000)
