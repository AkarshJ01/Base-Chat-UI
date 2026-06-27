
from langchain.chat_models import init_chat_model
from langchain.tools import tool
from langchain_core.messages import HumanMessage, SystemMessage , ToolMessage
import requests

import feedparser

LLM = "gpt-oss:20b"

# @tool
# def check_news()->str:
#     """Fetches real-time headlines and current event articles from the web.
#         Use this tool whenever the user asks for the latest news, updates, or current events."""
    
#     print("News Summary \n")

#     # target_url = "https://www.bloomberg.com/technology"
#     target_url = "https://www.techmeme.com/"

#     jina_url = f"https://r.jina.ai/{target_url}"

#     headers = {
#         "x-no-cache": "true"
#     }

#     response = requests.get(jina_url, headers=headers)

#     return response.text


@tool
def check_news()->str:
    """Fetches real-time headlines and current event articles from the web.
        Use this tool whenever the user asks for the latest news, updates, or current events."""
    
    feed_url = "https://feeds.bloomberg.com/technology/news.rss"
    feed = feedparser.parse(feed_url)

    print(f"Feed Title: {feed.feed.title}\n")

    formatted_articles = ""
    for entry in feed.entries[:5]:
        formatted_articles += f"Title: {entry.title}\n"
        formatted_articles += f"Summary: {entry.summary if 'summary' in entry else 'N/A'}\n"
        formatted_articles += f"Link: {entry.link}\n"
        formatted_articles += "-------------------\n"

    # print(formatted_articles)
    return formatted_articles





def run_agent(prompt:str):
    print("Hello This is an agent")

    tools = [check_news]
    tools_dict = {t.name: t for t in tools}

    llm = init_chat_model(LLM, model_provider="ollama", temperature=0)
    llm_with_tools = llm.bind_tools(tools)

    messages = [
        SystemMessage(
            content = ( "You are an expert research assistant. "
                        "Your primary goal is to provide the user with the latest current events.\n\n"

                        "CRITICAL ROUTING INSTRUCTIONS:\n"
                        "- If the user asks for the 'latest news', 'current events', 'what's happening in the world', "
                        "or any variation of searching for recent updates, you MUST immediately call the news tool.\n"
                        "- Do not try to answer from your internal knowledge base for recent news, as your training data "
                        "may be outdated. Always rely on the tool.\n\n"

                        "OUTPUT FORMATTING:\n"
                        "- When you receive the raw data from the news tool, DO NOT output the raw JSON or messy text.\n"
                        "- Instead, process the data and tell in one line what is your summary of the news")
        ),
        HumanMessage(content=prompt)
    ]

    ai_message = llm_with_tools.invoke(messages)
    messages.append(ai_message)

    tool_calls = ai_message.tool_calls

    if not tool_calls:
        print("There were no tool calls")
        return
    
    first_tool_call = tool_calls[0]

    
    tool_name = first_tool_call.get("name")
    tool_to_use = tools_dict.get(tool_name)

    tool_output = tool_to_use.invoke(first_tool_call.get("args", {}))

    if len(tool_output) > 8000:
            print("[Debug] Warning: Web data is huge! Truncating to 15k characters for local LLM safety.")
            tool_output = tool_output[:8000]

    tool_message = ToolMessage(
        content=tool_output,
        tool_call_id=first_tool_call["id"]
    )
    messages.append(tool_message)


    ai_response = llm_with_tools.invoke(messages)
    print(ai_response.content)





if __name__ == "__main__":
    # prompt = input(">>>> ")
    prompt = "Tell me the latest news"
    run_agent(prompt)
