# Product Sample Data Summary

## Database Structure Overview

The product database follows a flexible many-to-many relationship model that allows products to have multiple categories and customizable options based on their type.

### Core Tables

1. **products.product** - Main product table
   - `id` (UUID): Primary key
   - `name` (TEXT): Product name
   - `price` (BIGINT): Product price in Korean Won
   - `image_url` (TEXT): Product image URL
   - `created_at`, `updated_at` (TIMESTAMP): Timestamps

2. **products.categories** - Product categories
   - Material categories: 순금 (Pure Gold), 금 (Gold), 은 (Silver)
   - Type categories: 목걸이 (Necklace), 팔찌 (Bracelet), 반지 (Ring), 귀걸이 (Earring)

3. **products.options** - Available option types
   - 함량 (Purity): 14k, 18k
   - 사이즈 (Size): 10호-20호 (Sizes 10-20)
   - 색상 (Color): yellow, pink, silver

## Product Categories

### Material Categories (소재)
| ID | Name | Description |
|----|------|-------------|
| 1  | 순금 | Pure Gold |
| 2  | 금   | Gold |
| 3  | 은   | Silver |

### Type Categories (종류)
| ID | Name | Description |
|----|------|-------------|
| 4  | 목걸이 | Necklace |
| 5  | 팔찌  | Bracelet |
| 6  | 반지  | Ring |
| 7  | 귀걸이 | Earring |

## Available Options

### Option Types
1. **함량 (Purity)** - Option ID: 1
   - 14k (ID: 1)
   - 18k (ID: 2)

2. **사이즈 (Size)** - Option ID: 2
   - Ring sizes from 10호 to 20호 (IDs: 4-14)

3. **색상 (Color)** - Option ID: 3
   - yellow (ID: 15)
   - pink (ID: 16)
   - silver (ID: 17)

### Category-Option Mappings
- **Gold products (Category 2)** → Can have Purity (1) and Color (3) options
- **Rings (Category 5)** → Can have Size (2) options

## Sample Products

### 1. Gold Ring - All Options (금반지_모든옵션)
- **UUID**: 00000000-0000-0000-0000-000000000001
- **Price**: ₩300,000
- **Categories**: Gold (2), Ring (6)
- **Available Options**: All purity, size, and color options
- **Image**: [Product Image](https://search.pstatic.net/common/?src=https%3A%2F%2Fshopping-phinf.pstatic.net%2Fmain_8881040%2F88810407822.2.jpg&type=f372_372)

### 2. Gold Ring - Limited Options (금반지_14_18k만)
- **UUID**: 00000000-0000-0000-0000-000000000002
- **Price**: ₩280,000
- **Categories**: Gold (2), Ring (6)
- **Available Options**: Only 14k and 18k purity options
- **Image**: [Product Image](https://search.pstatic.net/common/?src=https%3A%2F%2Fsearchad-phinf.pstatic.net%2FMjAyNDA2MjRfMTkg%2FMDAxNzE5MjIwNzUwMDYx.7GUZmuFfKg32sDYNXf_Zr9b8rNcmwdHCSAy8Y9ZDkx8g.iqQXl_jU5mPNk46vKom82SzeBHYy6E8tNnhV-mFClC4g.PNG%2F1185960-1f77e095-962f-4e52-a060-52706dd96b65.png&type=f372_372)

### 3. Silver Ring - All Options (은반지_모든옵션)
- **UUID**: 00000000-0000-0000-0000-000000000003
- **Price**: ₩250,000
- **Categories**: Silver (3), Ring (6)
- **Available Options**: All applicable options for silver rings
- **Image**: [Product Image](https://search.pstatic.net/common/?src=https%3A%2F%2Fshopping-phinf.pstatic.net%2Fmain_8750081%2F87500811426.1.jpg&type=f372_372)

### 4. Gold Bracelet - All Options (금팔찌_모든옵션)
- **UUID**: 00000000-0000-0000-0000-000000000004
- **Price**: ₩350,000
- **Categories**: Gold (2), Bracelet (5)
- **Available Options**: Purity and color options (no size for bracelets)
- **Image**: [Product Image](https://search.pstatic.net/common/?src=https%3A%2F%2Fshopping-phinf.pstatic.net%2Fmain_8559585%2F85595859532.jpg&type=f372_372)

### 5. Gold Necklace - All Options (금목걸이_모든옵션)
- **UUID**: 00000000-0000-0000-0000-000000000005
- **Price**: ₩400,000
- **Categories**: Gold (2), Necklace (4)
- **Available Options**: Purity and color options
- **Image**: [Product Image](https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA4MjVfMTQx%2FMDAxNjkyOTU4ODg3NDUx.cm1leBN3YaRek1TprZ4JrDJLJMyvi4rbOmnXLw7-9qkg.WFsJptkCxJ1PhFrcj6XYxqQvRa3xP1kOcTKf8kK3wpcg.JPEG.dterra%2F20230814-DSC03321-23-08-14.jpg&type=sc960_832)

### 6. Silver Earrings - All Options (은귀걸이_모든옵션)
- **UUID**: 00000000-0000-0000-0000-000000000006
- **Price**: ₩270,000
- **Categories**: Silver (3), Earrings (7)
- **Available Options**: Applicable options for silver earrings
- **Image**: [Product Image](https://shop-phinf.pstatic.net/20240512_13/1715493682458iHtBd_JPEG/116629578194674771_1416493851.jpg?type=m510)

## Key Features

### Flexible Option System
The database design allows for:
- Different products to have different available options
- Category-based option restrictions (e.g., only rings have size options)
- Material-based option restrictions (e.g., gold products can have purity options)

### Price Range
- Silver Ring: ₩250,000 (lowest)
- Gold Necklace: ₩400,000 (highest)
- Average price: ~₩308,000

### Product Naming Convention
Products follow the pattern: `[Material][Type]_[Option Description]`
- Example: `금반지_모든옵션` (Gold Ring - All Options)
- Example: `금반지_14_18k만` (Gold Ring - Only 14k/18k)

## Implementation Notes

1. **Option Constraints**: The database enforces that products can only have options allowed for their categories through the `category_options` mapping table.

2. **Multi-Category Support**: Products can belong to multiple categories (e.g., a gold ring belongs to both "Gold" and "Ring" categories).

3. **Option Value Flexibility**: The `product_option_values` table allows specific products to have restricted option sets even when the category allows more options.

4. **Image Storage**: Product images are stored as external URLs, likely from Naver Shopping or similar platforms.

5. **Price Storage**: Prices are stored as BIGINT to avoid floating-point precision issues with currency.

## Frontend Display Recommendations

1. **Category Filtering**: Implement dual filtering by material (gold/silver) and type (ring/bracelet/necklace/earring).

2. **Option Selection**: Display only relevant options based on product categories:
   - Rings: Show size selector
   - Gold products: Show purity (14k/18k) and color options
   - Silver products: Show limited options based on product type

3. **Price Display**: Format prices with Korean Won symbol (₩) and thousand separators.

4. **Product Cards**: Display product image, name, base price, and available option indicators.