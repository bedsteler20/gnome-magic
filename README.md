# Gnome Magic

A extension that add various features to vscode to help building gnome apps

## Features

- Link to gresource file
- Debugging python apps in a flatpak
- Blueprint code formatting
- Project generator

## Requirements

[Flatpak Extension](https://marketplace.visualstudio.com/items?itemName=bilelmoussaoui.flatpak-vscode)

## Release Notes

### 0.2.1
- Fixed blueprint formatter braking properties with a `-` separator

### 0.2.0

- Added a project template system currently only works with python

### 1.0.0

- Allow for disabling indexing of resources via the option `gnome-magic.indexResources`
- Custom implementation of the blueprint language server based on the [Gtk Blueprint extension](https://marketplace.visualstudio.com/items?itemName=bodil.blueprint-gtk) with some changes
    - Uses the `blueprint-compiler` from a meson subproject if available
    - Code formatting
- Specifying `appId` in the python debugger configuration will run  `flatpak kill` when restarting or stopping the debugger

### 0.0.1

- Link to gresource in source code
- Allow debugging python apps in a flatpak
