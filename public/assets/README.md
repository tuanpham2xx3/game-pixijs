# Game Assets Structure

Cấu trúc thư mục assets cho game:

```
assets/
├── background/         # Hình nền cho các scene
│   ├── menu.png       # Màn hình menu
│   ├── gameplay.png   # Màn hình chơi game
│   ├── victory.png    # Màn hình chiến thắng 
│   └── defeat.png     # Màn hình thất bại
│
├── player/            # Tài nguyên cho người chơi
│   ├── heart.png      # Icon mạng sống
│   ├── idle.png       # Trạng thái đứng yên
│   ├── move.png       # Trạng thái di chuyển
│   └── hit.png        # Trạng thái bị đánh
│
├── enemies/           # Tài nguyên cho kẻ địch
│   ├── crep/          # Quái thường
│   │   ├── idle.png   # Trạng thái đứng yên
│   │   ├── move.png   # Trạng thái di chuyển
│   │   └── hit.png    # Trạng thái bị đánh
│   │
│   └── boss/          # Boss
│       ├── idle.png   # Trạng thái đứng yên
│       ├── move.png   # Trạng thái di chuyển
│       ├── attack.png # Trạng thái tấn công
│       └── hit.png    # Trạng thái bị đánh
│
├── bullets/           # Đạn của các nhân vật
│   ├── player_bullet.png    # Đạn cơ bản của người chơi
│   ├── player_level1.png    # Đạn cấp 1
│   ├── player_level2.png    # Đạn cấp 2
│   ├── player_level3.png    # Đạn cấp 3
│   ├── player_level4.png    # Đạn cấp 4
│   ├── player_level5.png    # Đạn cấp 5
│   ├── player_level6.png    # Đạn cấp 6
│   ├── enemy_bullet.png     # Đạn của quái thường
│   └── boss_bullet.png      # Đạn của boss
│
├── skills/            # Hiệu ứng kỹ năng
│   ├── player_skill.png     # Kỹ năng người chơi
│   └── boss_skill.png       # Kỹ năng boss
│
└── items/             # Các item trong game
    ├── heart.png      # Item hồi máu
    └── level_up.png   # Item tăng cấp
```

## Quy tắc đặt tên

- Sử dụng chữ thường và dấu gạch dưới
- Tên file phải mô tả rõ mục đích sử dụng
- Các trạng thái của nhân vật: idle, move, attack, hit
- Kích thước ảnh nên nhất quán trong cùng loại

## Định dạng file

- Sử dụng PNG cho hình ảnh game
- Độ phân giải phù hợp, không quá lớn để tối ưu hiệu năng
- Nền trong suốt cho các sprite

## Lưu ý

- Backup assets thường xuyên
- Tối ưu kích thước ảnh trước khi sử dụng
- Kiểm tra chất lượng hình ảnh sau khi tối ưu