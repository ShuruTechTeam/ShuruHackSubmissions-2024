import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shuru_frontent/pages/page1.dart';

void main() {
  runApp(const ProviderScope(child: MyMaterialBase()));
}

class MyMaterialBase extends StatefulWidget {
  const MyMaterialBase({super.key});

  @override
  State<MyMaterialBase> createState() => _MyMaterialBaseState();
}

class _MyMaterialBaseState extends State<MyMaterialBase> {
  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Page1(),
    );
  }
}
