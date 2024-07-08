import 'package:flutter/material.dart';
import 'package:flutter_chat_bubble/chat_bubble.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shuru_frontent/backend/api_interface.dart';

class Page5 extends ConsumerStatefulWidget {
  const Page5({super.key});

  @override
  ConsumerState<Page5> createState() => _Page5State();
}

class _Page5State extends ConsumerState<Page5> {
  List PersonaList = [
    ["Miner Max", "Advocate for increasing network capacity..."],
    ["Developer Dan", "Propose the development and implementation..."],
  ];
  String userInput = 'how to reduce evm gas fees';
  List<Map<String, String>> responses =
      []; // Updated to store responses with persona names
  bool isFetchingResponse = false;
  String pov_para = '';
  String currentTypingPersona = '';

  @override
  void initState() {
    super.initState();
    fetchResponsesSequentially();
  }

  void fetchResponsesSequentially() async {
    for (var i = 0; i < PersonaList.length; i++) {
      setState(() {
        isFetchingResponse = true;
        currentTypingPersona = "${PersonaList[i][0]} is typing...";
      });
      var response = await ApiInterface.getAgentResponse(
        agent_name: PersonaList[i][0],
        agent_perspective: PersonaList[i][1],
        problemStatement: userInput,
        ref: ref,
      );
      setState(() {
        responses.add({
          "persona": PersonaList[i][0],
          "response": "${PersonaList[i][0]}:\n$response",
        });
        pov_para += "$response ";
        isFetchingResponse = false;
      });
    }
    fetchSolution();
  }

  void fetchSolution() async {
    setState(() {
      isFetchingResponse = true;
      currentTypingPersona = "Finding solution...";
    });
    var solution = await ApiInterface.getSolution(
        pov_para: pov_para, problemStatement: userInput, ref: ref);
    setState(() {
      responses.add({
        "persona": "Solution",
        "response": "Based on the perspectives provided I suggest:\n$solution",
      });
      isFetchingResponse = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SizedBox(
          height: 500,
          width: 700,
          child: ListView.builder(
            itemCount: responses.length + 1 + (isFetchingResponse ? 1 : 0),
            itemBuilder: (context, index) {
              if (index == 0) {
                return ChatBubble(
                  backGroundColor: Colors.grey,
                  clipper: ChatBubbleClipper7(type: BubbleType.sendBubble),
                  padding: const EdgeInsets.all(10),
                  child: Text(userInput),
                );
              } else if (index <= responses.length) {
                // Check if it's the final solution or a persona response
                String displayText = responses[index - 1]["response"]!;
                return ChatBubble(
                  clipper: ChatBubbleClipper7(type: BubbleType.receiverBubble),
                  child: Text(displayText),
                );
              } else {
                return ChatBubble(
                  clipper: ChatBubbleClipper7(type: BubbleType.receiverBubble),
                  child: Text(currentTypingPersona),
                );
              }
            },
          ),
        ),
      ),
    );
  }
}
