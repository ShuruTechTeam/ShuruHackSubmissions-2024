import 'package:flutter_riverpod/flutter_riverpod.dart';

final promptProvider = StateProvider((ref) => '');
final userInputProvider = StateProvider((ref) => '');
final personaListProvider = StateProvider((ref) => []);
final connectionStatusProvider = StateProvider((ref) => '');
final ngrokURL = StateProvider((ref) => '');
