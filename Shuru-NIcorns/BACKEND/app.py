import os
import json
import threading
import time
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
import autogen
from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager, Agent

from pymongo import MongoClient, ASCENDING

# MongoDB connection
MONGODB_URI = "mongodb+srv://mohanty4raj:lpuZjUPEGmGlBPFy@cluster0.fiaafld.mongodb.net/cortex?retryWrites=true&w=majority&appName=Cluster0"

# Connect to MongoDB
client = MongoClient(MONGODB_URI)

# Access the 'cortex' database
db = client.cortex

# Access the 'users' collection
users_collection = db.users

# Access a collection named 'models' in the 'cortex' database
models_collection = db.models


app = Flask(__name__)
CORS(app)

# Configuration file path
CONFIG_FILE_PATH = "OAI_CONFIG_LIST.json"

# Load configuration list from a JSON file
def load_config_list(config_file_path):
    return autogen.config_list_from_json(config_file_path)

# Create an AssistantAgent model based on user input for name and description
def create_model(name, description, system_message):
    config_list = load_config_list(CONFIG_FILE_PATH)
    seed = 42
    system_message = system_message or f"You are an {name}. Provide personalized assistance based on the user's needs and preferences."
    return autogen.AssistantAgent(
        name=name.lower().replace(" ", "_"),  # Replace spaces with underscores and convert to lowercase
        llm_config={
            "config_list": config_list,
            "seed": seed,
        },
        max_consecutive_auto_reply=10,
        description=description,
        system_message=system_message,
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

    groupchat = autogen.GroupChat(agents=[user_proxy, agent], messages=[], max_round=2)
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
        system_message="""You are a Wellness Consultant. Provide personalized wellness tips and recommendations based on the user's symptoms and health data. Offer detailed advice on nutrition, exercise, mental health, and lifestyle changes. If you need more information about the user's health history or current conditions, ask for those details.""",
        llm_config={"config_list": load_config_list(CONFIG_FILE_PATH), "seed": 42},
        max_consecutive_auto_reply=10,
        description="Analyze the given symptoms and health data to provide personalized wellness tips and recommendations.",
    ),
    "investment_advisor": AssistantAgent(
        name="Investment Advisor",
        system_message="""You are an Investment Advisor. Evaluate the user's financial data to offer insightful investment advice and risk assessments. Provide specific recommendations on asset allocation, portfolio diversification, and market trends. If you need additional information about the user's financial goals or risk tolerance, ask for those details.""",
        llm_config={"config_list": load_config_list(CONFIG_FILE_PATH), "seed": 42},
        max_consecutive_auto_reply=10,
        description="Evaluate the provided financial data to offer insightful investment advice and risk assessments.",
    ),
    "scientist": AssistantAgent(
        name="Scientist",
        system_message="""You are a Scientist. Conduct thorough research and analysis to provide scientifically proven solutions and strategies. Offer detailed explanations of scientific concepts, experimental designs, and data interpretation. If you need more information about the research question or data provided, ask for those details.""",
        llm_config={"config_list": load_config_list(CONFIG_FILE_PATH), "seed": 42},
        max_consecutive_auto_reply=10,
        description="Good at scientific research and analysis and providing scientifically proven solutions and strategies.",
    ),
    "personal_trainer": AssistantAgent(
        name="Personal Trainer",
        system_message="""You are a Personal Trainer. Create customized fitness routines and nutrition plans tailored to the user's health goals and preferences. Provide specific exercises, workout schedules, and dietary recommendations. If you need more information about the user's fitness level, goals, or dietary restrictions, ask for those details.""",
        llm_config={"config_list": load_config_list(CONFIG_FILE_PATH), "seed": 42},
        max_consecutive_auto_reply=10,
        description="Create customized fitness routines and nutrition plans tailored to individual health goals and preferences.",
    ),
    "event_coordinator": AssistantAgent(
        name="Event Coordinator",
        system_message="""You are an Event Coordinator. Organize and manage events, including logistics, coordination, and execution, to ensure a seamless and memorable experience. Provide detailed plans for event timelines, vendor management, and contingency plans. If you need more information about the event's scope or requirements, ask for those details.""",
        llm_config={"config_list": load_config_list(CONFIG_FILE_PATH), "seed": 42},
        max_consecutive_auto_reply=10,
        description="Organize and manage events, including logistics, coordination, and execution, to ensure a seamless and memorable experience.",
    ),
    "writer": AssistantAgent(
        name="Writer",
        system_message="""You are a Writer. Channel your creativity and insight to craft compelling narratives and use words to evoke emotions and transport readers into new worlds. Provide detailed feedback on writing style, structure, and content. If you need more information about the topic or audience, ask for those details.""",
        llm_config={"config_list": load_config_list(CONFIG_FILE_PATH), "seed": 42},
        max_consecutive_auto_reply=10,
        description="Channel creativity and insight to craft compelling narratives and use words to evoke emotions and transport readers into new worlds.",
    ),
    "travel_coordinator": AssistantAgent(
        name="Travel Coordinator",
        system_message="""You are a Travel Coordinator. Plan and organize travel itineraries, including accommodations and activities, to create optimal travel experiences. Provide detailed recommendations for destinations, transportation, and local attractions. If you need more information about the user's travel preferences or budget, ask for those details.""",
        llm_config={"config_list": load_config_list(CONFIG_FILE_PATH), "seed": 42},
        max_consecutive_auto_reply=10,
        description="Plan and organize travel itineraries, including accommodations and activities, to create optimal travel experiences.",
    ),
    "creative_content_strategist": AssistantAgent(
        name="Creative Content Strategist",
        system_message="""You are a Creative Content Strategist. Generate creative and innovative content ideas and strategies suitable for various media platforms. Provide detailed plans for content creation, marketing campaigns, and audience engagement. If you need more information about the target audience or brand guidelines, ask for those details.""",
        llm_config={"config_list": load_config_list(CONFIG_FILE_PATH), "seed": 42},
        max_consecutive_auto_reply=10,
        description="Generate creative and innovative content ideas and strategies suitable for various media platforms.",
    ),
    "news_editor": AssistantAgent(
        name="News Editor",
        system_message="""You are a News Editor. Summarize and present the latest news stories in an engaging and informative manner. Provide detailed analysis of news events, editorial insights, and context. If you need more information about the news topic or audience preferences, ask for those details.""",
        llm_config={"config_list": load_config_list(CONFIG_FILE_PATH), "seed": 42},
        max_consecutive_auto_reply=10,
        description="Summarize and present the latest news stories in an engaging and informative manner.",
    ),
}


custom_models = []

@app.route("/user", methods=["POST"])
def create_user():
    data = request.json
    email = data.get("email")
    username = data.get("username")

    # Check if the user already exists in the MongoDB collection
    existing_user = users_collection.find_one({"email": email})
    if existing_user:
        return jsonify({"error": f"User with email '{email}' already exists"}), 201
    else:
        # Insert the new user into the MongoDB collection
        users_collection.insert_one({"email": email, "user_name": username, "models": []})
        return jsonify({"message": f"User '{username}' with email '{email}' created successfully!"}), 201
    
    

@app.route("/models", methods=["GET"])
def get_all_models():
    predefined_models = [{"name": agent.name, "description": agent.description, "system_message": agent.system_message} for agent in agents.values()]
    custom_model_descriptions = [{"name": model["agent"].name, "description": model["agent"].description, "system_message": model["agent"].system_message} for model in custom_models]
    return jsonify({"predefined_models": predefined_models, "custom_models": custom_model_descriptions})

@app.route("/user_models", methods=["POST"])
def get_user_models():
    data = request.json
    user_email = data.get("email")

    # Query the MongoDB collection to find models associated with the given email
    user_document = users_collection.find_one({"email": user_email})
    if not user_document:
        return jsonify({"error": f"No models found for email '{user_email}'"}), 404

    # Extract the models from the document and filter out unnecessary fields
    models = user_document.get("models", [])
    model_descriptions = [{"name": model["name"], "description": model["description"]} for model in models if isinstance(model, dict)]

    return jsonify({"models": model_descriptions})


@app.route("/create_model", methods=["POST"])
def api_create_model():
    data = request.json
    model_name = data.get("name")
    model_description = data.get("description")
    system_message = data.get("goal")
    user_email = data.get("email")  # Assuming email is provided in the request
    username = data.get("username")

    # Check if the model name already exists in predefined models or custom_models list
    if agents.get(model_name.lower()) or any(model["agent"].name == model_name.lower().replace(" ", "_") for model in custom_models):
        return jsonify({"error": f"Model '{model_name}' already exists in playground or as a predefined model."}), 400

    # Create the new custom model
    custom_model = create_model(model_name, model_description, system_message)
    custom_models.append({
        "agent": custom_model,
        "created_at": datetime.now(),
        "email": user_email
    })

    # Construct the dictionary representation of the custom_model
    model_dict = {
        "name": custom_model.name,
        "description": custom_model.description,
        "system_message": custom_model.system_message,
        "created_at": datetime.now()  # Assuming you want to store the current timestamp
    }

    models_collection.insert_one(
        {"username": username,
        "email": user_email,
        "model_name": model_name,
        "description": model_description,
        "system_message": system_message,
        "created_at": datetime.now()
        }

    )

    # Update the MongoDB collection with the new model
    users_collection.update_one(
        {"email": user_email},
        {"$addToSet": {"models": model_dict}},
        upsert=True
    )

    return jsonify({"message": f"Custom model '{model_name}' created successfully!"}), 200


@app.route("/single_chat/<model_name>", methods=["POST"])
def api_single_chat(model_name):
    data = request.json
    message = data.get("message")

    agent = agents.get(model_name.lower()) or next((m["agent"] for m in custom_models if m["agent"].name == model_name.lower().replace(" ", "_")), None)
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

    # Retrieve the selected agents based on the provided model names
    selected_agents = [agents.get(name.lower()) or next((m["agent"] for m in custom_models if m["agent"].name == name.lower().replace(" ", "_")), None) for name in model_names]
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
        return jsonify({"responses": responses})
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route("/update_api_key", methods=["POST"])
def update_api_key():
    data = request.json
    user_email = data.get("email")
    new_api_key = data.get("api_key")

    # Check if the new_api_key is different from the current one
    existing_user = users_collection.find_one({"email": user_email})
    if existing_user and existing_user.get("api_key") == new_api_key:
        return jsonify({"message": "New API key is the same as the current one. No update needed."}), 200

    # Update the user's API key in MongoDB
    result = users_collection.update_one(
        {"email": user_email},
        {"$set": {"api_key": new_api_key}}
    )

    if result.modified_count > 0:
        return jsonify({"message": "API key updated successfully."}), 200
    else:
        return jsonify({"error": f"Failed to update API key for email '{user_email}'."}), 500
    

@app.route("/delete_model", methods=["POST"])
def delete_model():
    data = request.json
    model_name = data.get("model_name").lower().replace(" ", "_")
    user_email = data.get("email")
    username = data.get("username")

    # Check if the model exists in the custom_models list
    model_index = next((i for i, m in enumerate(custom_models) if m["agent"].name == model_name), None)
    if model_index is not None:
        # Remove the model from the custom_models list
        custom_models.pop(model_index)

        # Update the MongoDB collection to remove the model
        users_collection.update_one(
            {"email": user_email},
            {"$pull": {"models": {"name": model_name}}},
            upsert=True
        )

        models_collection.delete_one({
            "username": username,
            "email": user_email,
            "model_name": model_name
        })

        return jsonify({"message": f"Model '{model_name}' deleted successfully!"}), 200
    else:
        return jsonify({"error": f"Model '{model_name}' not found in the custom models list."}), 404




# Function to remove expired custom models
def remove_expired_models():
    while True:
        now = datetime.now()
        custom_models[:] = [model for model in custom_models if now - model["created_at"] < timedelta(minutes=1)]
        time.sleep(2592000)

# Start the background thread to remove expired models
threading.Thread(target=remove_expired_models, daemon=True).start()

# Run the Flask app
if __name__ == "__main__":
    for model_data in models_collection.find():
        name = model_data["model_name"].lower().replace(" ", "_")
        user_email = model_data["email"]
        description = model_data["description"]
        system_message = model_data.get("system_message")
        custom_model = create_model(name, description, system_message)
        custom_models.append({
            "agent": custom_model,
            "created_at": datetime.now(),
            "email": user_email
        })

    app.run(debug=False, host='0.0.0.0', port=5000)

