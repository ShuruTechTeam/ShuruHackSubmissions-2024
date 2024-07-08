import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shuru_frontent/backend/api_interface.dart';
import 'package:shuru_frontent/backend/state.dart';
import 'package:shuru_frontent/pages/page2.dart';

class Page1 extends ConsumerStatefulWidget {
  const Page1({super.key});

  @override
  ConsumerState<Page1> createState() => _Page1State();
}

class _Page1State extends ConsumerState<Page1> {
  final TextEditingController textEditingController = TextEditingController();
  final TextEditingController textEditingController2 = TextEditingController();
  bool isConnected = false;
  @override
  Widget build(BuildContext context) {
    ref.watch(connectionStatusProvider);
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          image: DecorationImage(
            image: AssetImage("lib/assets/01.jpg"),
            fit: BoxFit.cover,
          ),
        ),
        child: Center(
          child: isConnected
              ? Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(left: 58.0, top: 100),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              Text(
                                "THE ROUND TABLE",
                                style: GoogleFonts.aBeeZee(
                                    fontSize: 100,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white),
                              )
                            ],
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.start,
                            children: [
                              Text(
                                "Tell us what is on your mind, We will set up a Round Table Conference with Intelligent AI agents",
                                style: GoogleFonts.ubuntuMono(
                                    fontSize: 22,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white),
                              )
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(
                      height: 350,
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 400.0),
                      child: TextField(
                        controller: textEditingController,
                        textAlign: TextAlign.center,
                        decoration: const InputDecoration(
                          fillColor: Colors.white70,
                          filled: true,
                          border: OutlineInputBorder(),
                          labelText: 'State Your Agenda For The Meeting',
                        ),
                        onSubmitted: (value) {
                          ApiInterface.getRephrasedPrompt(
                              problemStatement: textEditingController.text,
                              ref: ref);
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (context) => const Page2()),
                          );
                        },
                      ),
                    ),
                  ],
                )
              : Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 200.0),
                  child: TextField(
                    controller: textEditingController2,
                    textAlign: TextAlign.center,
                    decoration: const InputDecoration(
                      fillColor: Colors.white70,
                      filled: true,
                      border: OutlineInputBorder(),
                      labelText: 'ENTER ngrok URL',
                    ),
                    onSubmitted: (value) async {
                      ApiInterface.base_url = textEditingController2.text;
                      bool tmp = await ApiInterface.testConnection(ref: ref);
                      setState(() {
                        isConnected = tmp;
                      });
                    },
                  ),
                ),
        ),
      ),
    );
  }
}
