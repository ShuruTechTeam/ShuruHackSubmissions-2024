import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import 'package:shuru_frontent/backend/state.dart';

class ApiInterface {
  static var base_url = "http://localhost:5000";
  //Test
  static var test_connection = "$base_url/test_connection";
  //Rephrasing
  static var rephrase = "$base_url/rephrase";
  static var create_custom_persona = "$base_url/create_custom_persona";
  static var rephrase_with_feedback = "$base_url/rephrase_with_feedback";
  //Persona Creation
  static var create_persona_list = "$base_url/create_persona_list";
  //Chat
  static var get_agent_perspective = "$base_url/get_agent_perspective";
  static var generate_solution = "$base_url/generate_solution";
  static var get_agent_feedback = "$base_url/get_agent_feedback";
  static var generate_solution_with_feedback =
      "$base_url/generate_solution_with_feedback";

  static Future<bool> testConnection({required WidgetRef ref}) async {
    final response = await http.post(
      Uri.parse(test_connection),
      headers: {
        'Content-Type': 'application/json',
      },
      body: json.encode({}),
    );

    if (response.statusCode == 200) {
      // final responseData = json.decode(response.body);
      // final tmp = responseData['response'];
      // ref.read(connectionStatusProvider.notifier).update((state) => tmp);
      return true;
    } else {
      // print(
      //     'Failed to send problem statement. Status code: ${response.statusCode}');
      return false;
    }
  }

  static Future<void> getRephrasedPrompt(
      {required String problemStatement, required WidgetRef ref}) async {
    print(problemStatement);
    final response = await http.post(
      Uri.parse(rephrase),
      headers: {
        'Content-Type': 'application/json',
      },
      body: json.encode({"problem_statement": problemStatement}),
    );

    if (response.statusCode == 200) {
      final responseData = json.decode(response.body);
      final rephrasedPrompt = responseData['response'];
      ref.read(promptProvider.notifier).update((state) => rephrasedPrompt);
    } else {
      print(
          'Failed to send problem statement. Status code: ${response.statusCode}');
    }
  }

  static Future<void> getRephrasedPromptAfterFeedback(
      {required String previous_ver,
      required String feedback,
      required WidgetRef ref}) async {
    final response = await http.post(
      Uri.parse(rephrase_with_feedback),
      headers: {
        'Content-Type': 'application/json',
      },
      body: json.encode({
        "previous_ver": previous_ver,
        "feedback": feedback,
      }),
    );

    if (response.statusCode == 200) {
      final responseData = json.decode(response.body);
      final rephrasedPrompt = responseData['response'];
      ref.read(promptProvider.notifier).update((state) => rephrasedPrompt);
    } else {
      print(
          'Failed to send problem statement. Status code: ${response.statusCode}');
    }
  }

  static Future<void> getPersonaList(
      {required String problemStatement, required WidgetRef ref}) async {
    final response = await http.post(
      Uri.parse(create_persona_list),
      headers: {
        'Content-Type': 'application/json',
      },
      body: json.encode({"problem_statement": problemStatement}),
    );

    if (response.statusCode == 200) {
      final responseData = json.decode(response.body);
      List<dynamic> personaList = responseData['response'];
      ref.read(personaListProvider.notifier).update((state) => personaList);
    } else {
      print('error personaList: ${response.statusCode}');
    }
  }

  static Future<List> createCustomPersona({
    required String problem_statement,
    required String user_input,
    required WidgetRef ref,
  }) async {
    final response = await http.post(
      Uri.parse(create_custom_persona),
      headers: {
        'Content-Type': 'application/json',
      },
      body: json.encode({
        "problem_statement": problem_statement,
        "user_input": user_input,
      }),
    );

    if (response.statusCode == 200) {
      final responseData = json.decode(response.body);
      print('Decoded response data: $responseData');
      // print(responseData);
      // List<dynamic> personList = responseData['response'];
      // print(personList);

      // Extracting name and pov from the response
      String name = "${responseData['name']}";
      String pov = "${responseData['pov']}";
      // List<dynamic> tmpList = ref.read(personaListProvider);
      // List<dynamic> personaDetails = tmpList;
      // Creating a list and adding name and pov to it
      List<dynamic> persona = [name, pov];
      // personaDetails.add(persona);
      // ref
      //     .read(personaListProvider.notifier)
      //     .update((state) => [...state, ...personaDetails]);
      print('apis: $persona');
      return persona;
      // print(personaDetails[0]);
    } else {
      print('error personaList: ${response.statusCode}');
      return [];
    }
  }

  static Future<String> getAgentResponse(
      {required String agent_name,
      required String agent_perspective,
      required String problemStatement,
      required WidgetRef ref}) async {
    final response = await http.post(
      Uri.parse(get_agent_perspective),
      headers: {
        'Content-Type': 'application/json',
      },
      body: json.encode({
        "agent_name": agent_name,
        "agent_perspective": agent_perspective,
        "problem_statement": problemStatement
      }),
    );

    if (response.statusCode == 200) {
      final responseData = json.decode(response.body);
      return responseData['response'];
      // final rephrasedPrompt = responseData['response'];
      // ref.read(promptProvider.notifier).update((state) => rephrasedPrompt);
    } else {
      print(
          'Failed to send problem statement. Status code: ${response.statusCode}');
      return response.statusCode.toString();
    }
  }

  static Future<String> getSolution(
      {required String pov_para,
      required String problemStatement,
      required WidgetRef ref}) async {
    final response = await http.post(
      Uri.parse(generate_solution),
      headers: {
        'Content-Type': 'application/json',
      },
      body: json.encode({
        "pov_para": pov_para,
        "problem_statement": problemStatement,
      }),
    );

    if (response.statusCode == 200) {
      final responseData = json.decode(response.body);
      return responseData['response'];
      // final rephrasedPrompt = responseData['response'];
      // ref.read(promptProvider.notifier).update((state) => rephrasedPrompt);
    } else {
      print(
          'Failed to send problem statement. Status code: ${response.statusCode}');
      return response.statusCode.toString();
    }
  }

  static Future<String> getAgentFeedback(
      {required String agent_name,
      required String agent_perspective,
      required String problemStatement,
      required String solution,
      required WidgetRef ref}) async {
    final response = await http.post(
      Uri.parse(get_agent_feedback),
      headers: {
        'Content-Type': 'application/json',
      },
      body: json.encode({
        "agent_name": agent_name,
        "agent_perspective": agent_perspective,
        "problem_statement": problemStatement,
        "solution": solution
      }),
    );

    if (response.statusCode == 200) {
      final responseData = json.decode(response.body);
      return responseData['response'];
      // final rephrasedPrompt = responseData['response'];
      // ref.read(promptProvider.notifier).update((state) => rephrasedPrompt);
    } else {
      print(
          'Failed to send problem statement. Status code: ${response.statusCode}');
      return response.statusCode.toString();
    }
  }

  static Future<String> getSolutionWithFeedback(
      {required String feedback,
      required String problemStatement,
      required String prev_solution,
      required WidgetRef ref}) async {
    final response = await http.post(
      Uri.parse(generate_solution_with_feedback),
      headers: {
        'Content-Type': 'application/json',
      },
      body: json.encode({
        "feedback": feedback,
        "problem_statement": problemStatement,
        "prev_solution": prev_solution
      }),
    );

    if (response.statusCode == 200) {
      final responseData = json.decode(response.body);
      return responseData['response'];
      // final rephrasedPrompt = responseData['response'];
      // ref.read(promptProvider.notifier).update((state) => rephrasedPrompt);
    } else {
      print(
          'Failed to send problem statement. Status code: ${response.statusCode}');
      return response.statusCode.toString();
    }
  }
}
