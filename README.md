# Bugfixer

Bugfixer is an automated program repair system for C, Java and Python.

## Description

Bugfixer provides below features.

- Find bugs, generate patches and applying patch (C language).
- Find bugs, generate patches and applying patch (JAVA language).
- Find bugs, generate patches and applying patch (Python language).

## Demo

![Demo](./demo.gif)  

## Installation Guides

### Requirements

- docker 4.6.1+
- vscode 1.66.0+
- vscode extension development environment

### Preparation

- docker pull juniair/saver_docker:0.1.2
- docker pull jeminya/npex:1.1
- docker pull huna3869/manybugs:gzip-2009-09-26-a1d3d4019d-f17cbd13a1
- docker pull pyter:latest
- unpack the https://github.com/program-repair-project/bugfixer/blob/main/example.zip file to "example" directory

### Build

``` bash
git clone https://github.com/program-repair-project/bugfixer
cd bugfixer2
npm install
```

### Run/Debug

- Open project root directory in the Visual Studio Code
- Press F5 to Run/Debug
- Press ctrl + shift + p. Then
  - To fix C code with testcases (test script), type "Bugfixer" and select "Bugfixer 실행: 명세 기반 분석 [C]"
    - To see the best result, run "open directory" command (ctrl +k, c) and select "example/moses/gzip/src".
  - To fix Memory Leak Error in your C code, type "Bugfixer" and select "Bugfixer 실행: 명세 없이 분석 [C]"
    - To see the best result, run "open directory" command (ctrl +k, c) and select "example/saver/WavPack".
  - To fix Null Pointer Exception in your Java code, type "Bugfixer" and select "Bugfixer 실행: 명세 없이 분석 [Java]"
    - To see the best result, run "open directory" command (ctrl +k, c) and select "example/npex/aries-jpa-example".
  - To fix Type Error in your Python code, type "Bugfixer" and select "Bugfixer 실행: 명세 없이 분석 [Python]"
    - To see the best result, run "open directory" command (ctrl +k, c) and select "example/pyter".
- Now you can see error list and see the patch with the diff form.

### Related Information

- [VS Code Extension API](https://code.visualstudio.com/api)