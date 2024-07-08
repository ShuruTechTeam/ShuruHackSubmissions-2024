import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shuru_frontent/backend/api_interface.dart';
import 'package:shuru_frontent/backend/state.dart';
import 'package:shuru_frontent/pages/page1.dart';
import 'package:shuru_frontent/pages/page4.dart';

class Page3 extends ConsumerStatefulWidget {
  const Page3({super.key});

  @override
  ConsumerState<Page3> createState() => _Page3State();
}

class _Page3State extends ConsumerState<Page3> {
  final TextEditingController textEditingController = TextEditingController();
  bool isCreatingAgent = false;
  List PersonaList = [
    // [
    //   'Population Control Paul',
    //   'Advocates for and implements government policies that provide financial incentives for smaller families, such as tax breaks and subsidies.'
    // ],
    // [
    //   'Educated Eva',
    //   'Promotes investment in accessible education for girls and women to expand economic opportunities, leading to delayed marriage and fewer children.'
    // ],
  ];
  String agenda = '';
  @override
  void initState() {
    agenda = ref.read(promptProvider);
    PersonaList = ref.read(personaListProvider);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    PersonaList = ref.watch(personaListProvider);
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          image: DecorationImage(
            image: AssetImage("lib/assets/03.jpg"),
            fit: BoxFit.cover,
          ),
        ),
        child: Center(
          child: PersonaList.isEmpty || isCreatingAgent
              ? Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    const SizedBox(
                      height: 20,
                    ),
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
                      'Creating AI Agents...',
                      style: GoogleFonts.aBeeZee(
                          fontSize: 40,
                          fontWeight: FontWeight.bold,
                          color: Colors.white),
                    ),
                  ],
                ) // Show loading indicator when list is empty
              : Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(
                      height: 60,
                    ),
                    Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Below is a List of AI Agents that will be joining the conference.',
                          style: GoogleFonts.aBeeZee(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.black54),
                        ),
                        Text(
                          'We have created 2 AI Agents, You can remove them using "X".',
                          style: GoogleFonts.aBeeZee(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.black54),
                        ),
                        Text(
                          'Create Custom AI Agents using the below TextField. You can create as many AI Agents as you want',
                          style: GoogleFonts.aBeeZee(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.black54),
                        ),
                      ],
                    ),
                    const SizedBox(
                      height: 30,
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: List.generate(
                        PersonaList.length,
                        (index) {
                          if (PersonaList.length > index &&
                              PersonaList[index].length >= 2) {
                            return Stack(
                              children: [
                                Card(
                                  shape: const RoundedRectangleBorder(
                                    borderRadius: BorderRadius.zero,
                                  ),
                                  color: Colors.white12,
                                  child: Container(
                                    height: 300,
                                    width: 240,
                                    padding: const EdgeInsets.all(8),
                                    child: Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          PersonaList[index][0],
                                          style: GoogleFonts.aBeeZee(
                                              fontSize: 14,
                                              fontWeight: FontWeight.bold,
                                              color: Colors.black54),
                                        ),
                                        const SizedBox(
                                          height: 10,
                                        ),
                                        Text(
                                          PersonaList[index][1],
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                Positioned(
                                  right: 0,
                                  top: 0,
                                  child: IconButton(
                                    icon: const Icon(Icons.close,
                                        color: Colors.black),
                                    onPressed: () {
                                      setState(() {
                                        PersonaList.removeAt(index);
                                        ref
                                            .read(personaListProvider.notifier)
                                            .update((state) => PersonaList);
                                      });
                                    },
                                  ),
                                ),
                              ],
                            );
                          } else {
                            return Container();
                          }
                        },
                      ),
                    ),
                    const SizedBox(
                      height: 100,
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 48.0),
                      child: TextField(
                        controller: textEditingController,
                        decoration: const InputDecoration(
                          fillColor: Colors.white70,
                          filled: true,
                          border: OutlineInputBorder(),
                          labelText:
                              'Write a short description to create your own custom AI Agent',
                        ),
                        onSubmitted: (val) async {
                          setState(() {
                            isCreatingAgent = true;
                          });
                          List lst = await ApiInterface.createCustomPersona(
                              problem_statement: agenda,
                              user_input: textEditingController.text,
                              ref: ref);
                          textEditingController.clear();
                          setState(() {
                            isCreatingAgent = false;
                          });
                          print(lst);
                          setState(() {
                            PersonaList.add(lst);
                            ref
                                .read(personaListProvider.notifier)
                                .update((state) => PersonaList);
                          });
                        },
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(28.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
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
                            width: 200,
                          ),
                          Text(
                            'Click To Continue To Conference >',
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
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                      builder: (context) => const Page4()),
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
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}
