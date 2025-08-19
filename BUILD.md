# Build Instructions for kanapadadu

This guide covers how to build kanapadadu for macOS, Windows, and Linux distributions.

## Prerequisites

- Node.js 18+ and pnpm
- Python 3.8+ (for native dependencies)
- Platform-specific requirements:
  - **macOS**: Xcode Command Line Tools
  - **Windows**: Visual Studio Build Tools or Visual Studio 2019+
  - **Linux**: Essential build tools (gcc, make, etc.)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/ibttf/interview-coder-frontend.git
cd interview-coder-frontend
```

2. Install dependencies:
```bash
pnpm install
```

3. Build the application:
```bash
pnpm run build
```

## Creating Distributables

### macOS

Build DMG and ZIP packages for both Intel and Apple Silicon:

```bash
# Build for current architecture
pnpm run app:build

# Build for specific architecture
pnpm run app:build -- --mac --x64
pnpm run app:build -- --mac --arm64

# Build universal binary
pnpm run app:build -- --mac --universal
```

Output files:
- `release/kanapadadu-{version}.dmg` - Installer package
- `release/kanapadadu-{version}-mac.zip` - Portable application

### Windows

Build NSIS installer and portable executable:

```bash
# Build for Windows (x64 and x86)
pnpm run app:build -- --win

# Build specific architecture
pnpm run app:build -- --win --x64
pnpm run app:build -- --win --ia32
```

Output files:
- `release/Interview Coder Setup {version}.exe` - NSIS installer
- `release/Interview Coder {version}.exe` - Portable executable

### Linux

Build AppImage, Debian package, and tar.gz:

```bash
# Build for Linux
pnpm run app:build -- --linux

# Build specific formats
pnpm run app:build -- --linux AppImage
pnpm run app:build -- --linux deb
pnpm run app:build -- --linux tar.gz
```

Output files:
- `release/Interview Coder-{version}.AppImage` - Universal Linux package
- `release/interview-coder_{version}_amd64.deb` - Debian/Ubuntu package
- `release/interview-coder-{version}.tar.gz` - Compressed archive

## Development Builds

For development and testing:

```bash
# Run in development mode
pnpm run dev

# Run Electron app in development
pnpm run app:dev
```

## Icon Requirements

The build process requires icons in specific formats:

- **macOS**: `assets/icons/mac/icon.icns` (512x512 ICNS format)
- **Windows**: `assets/icons/win/icon.ico` (256x256 ICO format)
- **Linux**: `assets/icons/png/` directory with PNG files (16x16 to 512x512)

## Code Signing (Production)

### macOS
```bash
# Set environment variables
export CSC_LINK="path/to/certificate.p12"
export CSC_KEY_PASSWORD="certificate_password"
export APPLE_ID="your@apple.id"
export APPLE_ID_PASSWORD="app_specific_password"

# Build with signing
pnpm run app:build -- --mac
```

### Windows
```bash
# Set environment variables
export CSC_LINK="path/to/certificate.p12"
export CSC_KEY_PASSWORD="certificate_password"

# Build with signing
pnpm run app:build -- --win
```

## Environment Variables

Create a `.env` file for configuration:

```env
# Build configuration
NODE_ENV=production
ELECTRON_BUILDER_CACHE_DIR=.cache

# Code signing (optional)
CSC_LINK=path/to/certificate
CSC_KEY_PASSWORD=password

# macOS notarization (optional)
APPLE_ID=your@apple.id
APPLE_ID_PASSWORD=app_specific_password
APPLE_TEAM_ID=your_team_id
```

## Troubleshooting

### Common Issues

1. **Native dependency compilation errors**:
   ```bash
   # Rebuild native modules
   pnpm run rebuild
   ```

2. **Permission errors on macOS**:
   ```bash
   # Allow unsigned apps
   sudo spctl --master-disable
   ```

3. **Windows antivirus false positives**:
   - Add the build directory to antivirus exclusions
   - Use code signing to reduce false positives

4. **Linux missing dependencies**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install build-essential libnss3-dev libatk-bridge2.0-dev libdrm2 libxkbcommon-dev libxss1 libasound2-dev

   # CentOS/RHEL
   sudo yum install gcc-c++ make nss atk-devel gtk3-devel libdrm-devel
   ```

## Distribution

The built applications are self-contained and can be distributed directly. No additional dependencies are required on target machines.

### File Sizes (Approximate)
- macOS DMG: ~150-200 MB
- Windows Installer: ~120-160 MB  
- Linux AppImage: ~140-180 MB

## Auto-Updates

The application includes built-in update checking. Configure the update server in the build configuration or disable auto-updates by setting `publish` to `null` in `package.json`.
