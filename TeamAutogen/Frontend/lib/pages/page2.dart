import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shuru_frontent/backend/api_interface.dart';
import 'package:shuru_frontent/backend/state.dart';
import 'package:shuru_frontent/pages/page1.dart';
import 'package:shuru_frontent/pages/page3.dart';

class Page2 extends ConsumerStatefulWidget {
  const Page2({super.key});

  @override
  ConsumerState<Page2> createState() => _Page2State();
}

class _Page2State extends ConsumerState<Page2> {
  String prompt = '';
  final TextEditingController textEditingController = TextEditingController();
  @override
  void initState() {
    prompt = ref.read(promptProvider);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    prompt = ref.watch(promptProvider);
    if (prompt == '') {
      return Scaffold(
        body: Container(
          decoration: const BoxDecoration(
            image: DecorationImage(
              image: AssetImage("lib/assets/02.jpg"),
              fit: BoxFit.cover,
            ),
          ),
          child: Center(
              child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(
                width: 120,
                height: 120,
                child: CircularProgressIndicator(
                  color: Colors.white,
                  strokeWidth: 8,
                ),
              ),
              const SizedBox(
                height: 50,
              ),
              Text(
                'Trying To Decipher That...',
                style: GoogleFonts.aBeeZee(
                    fontSize: 40,
                    fontWeight: FontWeight.bold,
                    color: Colors.white),
              ),
            ],
          )),
        ),
      );
    }
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          image: DecorationImage(
            image: AssetImage("lib/assets/02.jpg"),
            fit: BoxFit.cover,
          ),
        ),
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(28.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const SizedBox(
                  height: 200,
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Text(
                      'We Have Refined The Agenda For You',
                      style: GoogleFonts.aBeeZee(
                          fontSize: 40,
                          fontWeight: FontWeight.bold,
                          color: Colors.white),
                    ),
                  ],
                ),
                const SizedBox(
                  height: 20,
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Text(
                      prompt,
                      style: GoogleFonts.aBeeZee(
                          fontSize: 20,
                          // fontWeight: FontWeight.bold,
                          color: Colors.white),
                    ),
                  ],
                ),
                const SizedBox(
                  height: 120,
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text(
                        "Doesn't seem right? You can suggest improvements in the field below",
                        style: GoogleFonts.aBeeZee(
                            fontSize: 20,
                            // fontWeight: FontWeight.bold,
                            color: Colors.white),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(left: 500.0, right: 8),
                  child: TextField(
                    controller: textEditingController,
                    decoration: const InputDecoration(
                      fillColor: Colors.white70,
                      filled: true,
                      border: OutlineInputBorder(),
                      labelText: 'Suggest improvements to refine agenda',
                    ),
                    onSubmitted: (val) {
                      ApiInterface.getRephrasedPromptAfterFeedback(
                          previous_ver: prompt,
                          feedback: textEditingController.text,
                          ref: ref);
                      ref.read(promptProvider.notifier).update((state) => '');
                      textEditingController.clear();
                    },
                  ),
                ),
                SizedBox(
                  height: 200,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            decoration: const BoxDecoration(
                              color: Colors
                                  .white, // Set the container color to white
                              shape: BoxShape
                                  .circle, // Make the container circular
                            ),
                            child: IconButton(
                              onPressed: () {
                                ref
                                    .read(promptProvider.notifier)
                                    .update((state) => '');
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                      builder: (context) => const Page1()),
                                );
                              },
                              icon: const Icon(
                                Icons.arrow_back,
                                size: 50,
                              ),
                            ),
                          ),
                          Text(
                            '< Click To Start Over',
                            style: GoogleFonts.ubuntuMono(
                                fontSize: 20,
                                // fontWeight: FontWeight.bold,
                                color: Colors.white),
                          ),
                          const SizedBox(
                            width: 700,
                          ),
                          Text(
                            'Continue to Agent Creation >',
                            style: GoogleFonts.ubuntuMono(
                                fontSize: 20,
                                // fontWeight: FontWeight.bold,
                                color: Colors.white),
                          ),
                          Container(
                            decoration: const BoxDecoration(
                              color: Colors
                                  .white, // Set the container color to white
                              shape: BoxShape
                                  .circle, // Make the container circular
                            ),
                            child: IconButton(
                              onPressed: () {
                                ApiInterface.getPersonaList(
                                    problemStatement: prompt, ref: ref);
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                      builder: (context) => const Page3()),
                                );
                              },
                              icon: const Icon(
                                Icons.arrow_forward,
                                size: 50,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
