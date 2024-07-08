import 'package:flutter/material.dart';
import 'package:flutter_chat_bubble/chat_bubble.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shuru_frontent/backend/api_interface.dart';
import 'package:shuru_frontent/backend/state.dart';
import 'package:shuru_frontent/pages/page1.dart';

class Page4 extends ConsumerStatefulWidget {
  const Page4({super.key});

  @override
  ConsumerState<Page4> createState() => _Page4State();
}

class _Page4State extends ConsumerState<Page4> {
  List PersonaList = [];
  String userInput = '';
  List<Map<String, String>> responses = [];
  bool isFetchingResponse = false;
  String pov_para = '';
  String feedback_para = '';
  String currentTypingPersona = '';
  String finalSolution = '';
  bool showFeedbackInput = false;
  final TextEditingController feedbackController = TextEditingController();

  @override
  void initState() {
    userInput = ref.read(promptProvider);
    PersonaList = ref.read(personaListProvider);
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
      currentTypingPersona = "Pseudo Admin is forming a solution...";
    });
    var solution = await ApiInterface.getSolution(
        pov_para: pov_para, problemStatement: userInput, ref: ref);
    setState(() {
      finalSolution = solution; // Store the final solution
      responses.add({
        "persona": "Solution",
        "response":
            "Pseudo Admin: \n Based on the suggestions provided I came up with this solution:\n$solution",
      });
      isFetchingResponse = false;
    });
    fetchAgentFeedback(); // Call fetchAgentFeedback after fetching the solution
  }

  Future<void> fetchAgentFeedback() async {
    for (var i = 0; i < PersonaList.length; i++) {
      setState(() {
        isFetchingResponse = true;
        currentTypingPersona = "${PersonaList[i][0]} is typing...";
      });
      var feedback = await ApiInterface.getAgentFeedback(
        agent_name: PersonaList[i][0],
        agent_perspective: PersonaList[i][1],
        problemStatement: userInput,
        solution: finalSolution,
        ref: ref,
      );
      setState(() {
        responses.add({
          "persona": PersonaList[i][0],
          "feedback": "${PersonaList[i][0]}:\n$feedback",
        });
        feedback_para += "$feedback "; // Append feedback to feedback_para
        isFetchingResponse = false;
      });
    }
    getSolutionAfterFeedback(); // Call getSolutionAfterFeedback after fetching all feedbacks
  }

  void getSolutionAfterFeedback() async {
    setState(() {
      isFetchingResponse = true;
      currentTypingPersona = "Pseudo Admin: \nProcessing feedback...";
    });
    var userFeedbackResponse = await ApiInterface.getSolutionWithFeedback(
        prev_solution: finalSolution,
        feedback: feedback_para,
        problemStatement: userInput,
        ref: ref);
    setState(() {
      finalSolution =
          userFeedbackResponse; // Set the value of finalSolution to the response
      responses.add({
        "persona": "User Feedback",
        "response":
            "Pseudo Admin: \n Based on the feedback provided I Suggest:\n$userFeedbackResponse",
      });
      isFetchingResponse = false;
      showFeedbackInput =
          true; // Show the feedback input and text after loading the bubbles
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          image: DecorationImage(
            image: AssetImage("lib/assets/04.jpg"),
            fit: BoxFit.cover,
          ),
        ),
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 80.0, vertical: 40),
            child: Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    itemCount:
                        responses.length + 1 + (isFetchingResponse ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == 0) {
                        return ChatBubble(
                          clipper:
                              ChatBubbleClipper4(type: BubbleType.sendBubble),
                          alignment: Alignment.topRight,
                          margin: const EdgeInsets.all(20),
                          backGroundColor: Colors.blueGrey,
                          child: Container(
                            constraints: BoxConstraints(
                              maxWidth: MediaQuery.of(context).size.width * 0.7,
                            ),
                            child: Text(
                              userInput,
                              style: const TextStyle(
                                  color: Colors.white, fontSize: 18),
                            ),
                          ),
                        );
                      } else if (index <= responses.length) {
                        String displayText = responses[index - 1]["response"] ??
                            responses[index - 1]["feedback"]!;
                        return
                            // ChatBubble(
                            //   clipper: ChatBubbleClipper7(
                            //       type: BubbleType.receiverBubble),
                            //   child: Text(displayText),
                            // );
                            ChatBubble(
                          clipper: ChatBubbleClipper4(
                              type: BubbleType.receiverBubble),
                          backGroundColor: const Color(0xffE7E7ED),
                          margin: const EdgeInsets.only(top: 20),
                          child: Container(
                            constraints: BoxConstraints(
                              maxWidth: MediaQuery.of(context).size.width * 0.7,
                            ),
                            child: Text(
                              displayText,
                              style: const TextStyle(color: Colors.black),
                            ),
                          ),
                        );
                      } else {
                        return ChatBubble(
                          clipper: ChatBubbleClipper4(
                              type: BubbleType.receiverBubble),
                          backGroundColor: const Color(0xffE7E7ED),
                          margin: const EdgeInsets.only(top: 20),
                          child: Container(
                            constraints: BoxConstraints(
                              maxWidth: MediaQuery.of(context).size.width * 0.7,
                            ),
                            child: Text(
                              currentTypingPersona,
                              style: const TextStyle(color: Colors.black),
                            ),
                          ),
                        );
                        // ChatBubble(
                        //   clipper: ChatBubbleClipper7(
                        //       type: BubbleType.receiverBubble),
                        //   child: Text(currentTypingPersona),
                        // );
                      }
                    },
                  ),
                ),
                if (showFeedbackInput) ...[
                  // Padding(
                  //   padding: EdgeInsets.all(8.0),
                  //   child: Text(
                  //     "To continue, give feedback in the text field below",
                  //     style: GoogleFonts.ubuntuMono(
                  //         fontSize: 20,
                  //         fontWeight: FontWeight.bold,
                  //         color: Colors.white70),
                  //   ),
                  // ),
                  Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 100.0, vertical: 40),
                    child: TextField(
                      controller: feedbackController,
                      decoration: const InputDecoration(
                        fillColor: Colors.white,
                        filled: true,
                        border: OutlineInputBorder(),
                        labelText:
                            'To Continue The Discussion Please Provide Some Feedback',
                      ),
                      onSubmitted: (value) async {
                        setState(() {
                          feedback_para =
                              ''; // Reset feedback_para before appending new feedback
                          feedback_para += "$value "; // Append the new feedback
                          responses.add({
                            "persona": "User",
                            "response": "User Feedback:\n$value",
                          }); // Add a senderBubble with the submitted text
                        });
                        fetchAgentFeedback() // Fetch feedback from agents
                            .then((_) => getSolutionAfterFeedback());
                        feedbackController
                            .clear(); // Clear the text field after submission
                      },
                    ),
                  ),
                ],
                if (isFetchingResponse)
                  const CircularProgressIndicator(
                    color: Colors.blueGrey,
                    backgroundColor: Colors.white,
                  ),
              ],
            ),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: Colors.white,
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const Page1()),
          );
        },
        child: const Icon(Icons.exit_to_app),
      ),
    );
  }
}
