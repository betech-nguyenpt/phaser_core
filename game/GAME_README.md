# Snake Hunt 🐍

Một game Rắn (Snake) đầu tiên người chơi hoàn chỉnh được xây dựng trên Phaser 3 + React + TypeScript.

## Tính Năng

### 🎮 3 Scene Chính

1. **MainMenu** - Menu chính với nút "START GAME"
2. **Game** - Gameplay chính nơi bạn điều khiển rắn
3. **GameOver** - Hiển thị kết quả cuối cùng

### 🌍 Game World

- **Kích thước**: 500,000 × 500,000 pixel
- **Nền** xanh đen cho không gian rộng lớn

### 🐍 Rắn

#### Rắn Người Chơi
- **Màu**: Xanh lá cây 🟢
- **Kích thước ban đầu**: 50 segment
- **Vị trí bắt đầu**: Ngẫu nhiên trên game world
- **Điều khiển**:
  - **Arrow Keys** (↑ ↓ ← →)
  - **WASD Keys**

#### Bot Snakes
- **Số lượng**: ~100 con
- **Màu**: Đỏ, xanh dương, tím, cyan, vàng, cam
- **AI**: Di chuyển ngẫu nhiên, tránh biên, tìm kiếm thức ăn

### 🍯 Thức Ăn

- **Số lượng**: ~2,500 hạt (2% của diện tích world)
- **Màu**: Vàng 🟡
- **Hiệu ứng**: Rắn tăng kích thước khi ăn
- **Xuất hiện tự động**: Khi bot snakes chết, body của chúng biến thành food

### ⚔️ Lối Chơi

1. Điều khiển rắn xanh của bạn ăn các hạt vàng
2. Tránh va chạm với các rắn bot
3. Tránh chạm biên của game world
4. Rắn của bạn sẽ lớn hơn mỗi khi ăn food
5. Sống sót lâu nhất có thể!

### 💀 Điều Kiện Game Over

Game kết thúc khi rắn của bạn:
- ✗ Chạm vào biên của world
- ✗ Chạm vào thân của rắn bot khác
- ✗ Tự va chạm vào thân của mình (nếu dài)

### 📊 Thông Tin Hiển Thị

Trong quá trình chơi, bạn sẽ thấy:
- **Length**: Kích thước rắn hiện tại
- **Bots Alive**: Số lượng bot còn sống
- **Food**: Số lượng food còn lại
- **Pos**: Vị trí hiện tại của đầu rắn
- **Controls**: Gợi ý điều khiển

## 📁 Cấu Trúc Tệp

```
game/src/game/
├── scenes/
│   ├── Boot.ts          # Khởi động game, load assets
│   ├── Preloader.ts     # Nạp tài nguyên
│   ├── MainMenu.ts      # Menu chính (có nút START)
│   ├── Game.ts          # Gameplay chính
│   └── GameOver.ts      # Màn hình game over
├── utils/
│   ├── Snake.ts         # Class Rắn
│   ├── Food.ts          # Class Thức ăn
│   ├── GameLogic.ts     # Logic chơi game
│   └── Common.ts        # Utility functions
└── main.ts              # Cấu hình Phaser
```

## 🚀 Cách Chạy

1. **Cài đặt dependencies** (nếu chưa)
   ```bash
   cd game
   npm install
   ```

2. **Chạy dev server**
   ```bash
   npm run dev
   ```

3. **Mở trình duyệt**
   ```
   http://localhost:8081
   ```

## 🎯 Chiến Lược Chơi

- **Tập trung ăn food**: Mỗi food tăng 1 segment cho rắn
- **Tránh chạm biên**: Camera dù theo rắn nhưng cẩn thận gần biên
- **Tránh rắn bot**: Bot snakes di chuyển ngẫu nhiên nhưng có thể khó lường
- **Khu vực an toàn**: Part giữa world thường an toàn hơn gần biên

## 🔧 Thông Số Kỹ Thuật

| Tham số | Giá trị |
|---------|--------|
| World Width | 500,000 px |
| World Height | 500,000 px |
| Initial Snake Length | 50 |
| Number of Bot Snakes | 100 |
| Number of Food Items | ~2,500 |
| Snake Segment Radius | 15 px |
| Food Radius | 8 px |
| Movement Speed | 50 ms/move |

## 🎨 Màu Sắc

| Đối tượng | Màu | Mã Hex |
|----------|-----|--------|
| Rắn Người Chơi | Xanh lá | #00FF00 |
| Bot Snakes | Nhiều | #FF6666, #6666FF, etc. |
| Food | Vàng | #FFFF00 |
| World | Xám | #1A1A2E |

## 📝 Ghi Chú

- **Performance**: Với 100 bots + 2500 foods, game cần máy tính khá mạnh
- **Collision Detection**: Sử dụng phương pháp Euclidean distance
- **Bot AI**: Di chuyển ngẫu nhiên + tránh biên
- **Graphics**: Sử dụng Phaser Graphics API để vẽ circles

## 🎵 Tiếp Theo

Có thể bổ sung:
- Sound effects
- Music
- Power-ups
- More sophisticated bot AI
- Leaderboard
- Different game modes
