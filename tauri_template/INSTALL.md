# Tauri template

```bash
tauri_template % curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
info: downloading installer

Welcome to Rust!

This will download and install the official compiler for the Rust
programming language, and its package manager, Cargo.

Rustup metadata and toolchains will be installed into the Rustup
home directory, located at:

  /Users/nixforest/.rustup

This can be modified with the RUSTUP_HOME environment variable.

The Cargo home directory is located at:

  /Users/nixforest/.cargo

This can be modified with the CARGO_HOME environment variable.

The cargo, rustc, rustup and other commands will be added to
Cargo's bin directory, located at:

  /Users/nixforest/.cargo/bin

This path will then be added to your PATH environment variable by
modifying the profile files located at:

  /Users/nixforest/.profile
  /Users/nixforest/.zshenv

You can uninstall at any time with rustup self uninstall and
these changes will be reverted.

Current installation options:


   default host triple: aarch64-apple-darwin
     default toolchain: stable (default)
               profile: default
  modify PATH variable: yes

1) Proceed with standard installation (default - just press enter)
2) Customize installation
3) Cancel installation
>

info: profile set to 'default'
info: default host triple is aarch64-apple-darwin
info: syncing channel updates for 'stable-aarch64-apple-darwin'
info: latest update on 2025-12-11, rust version 1.92.0 (ded5c06cf 2025-12-08)
info: downloading component 'cargo'
  8.2 MiB /   8.2 MiB (100 %) 400.0 KiB/s in 25s         
info: downloading component 'clippy'
  2.8 MiB /   2.8 MiB (100 %)   2.0 MiB/s in  1s         
info: downloading component 'rust-docs'
 20.5 MiB /  20.5 MiB (100 %)  19.0 MiB/s in  1s         
info: downloading component 'rust-std'
 26.0 MiB /  26.0 MiB (100 %) 436.8 KiB/s in 29s         
info: downloading component 'rustc'
 60.9 MiB /  60.9 MiB (100 %) 457.6 KiB/s in  2m 23s             
info: downloading component 'rustfmt'
info: installing component 'cargo'
info: installing component 'clippy'
info: installing component 'rust-docs'
 20.5 MiB /  20.5 MiB (100 %)   4.2 MiB/s in  2s         
info: installing component 'rust-std'
info: installing component 'rustc'
 60.9 MiB /  60.9 MiB (100 %)  28.5 MiB/s in  2s         
info: installing component 'rustfmt'
info: default toolchain set to 'stable-aarch64-apple-darwin'

  stable-aarch64-apple-darwin installed - rustc 1.92.0 (ded5c06cf 2025-12-08)


Rust is installed now. Great!

To get started you may need to restart your current shell.
This would reload your PATH environment variable to include
Cargo's bin directory ($HOME/.cargo/bin).

To configure your current shell, you need to source
the corresponding env file under $HOME/.cargo.

This is usually done by running one of the following (note the leading DOT):
. "$HOME/.cargo/env"            # For sh/bash/zsh/ash/dash/pdksh
source "$HOME/.cargo/env.fish"  # For fish
source $"($nu.home-path)/.cargo/env.nu"  # For nushell
```