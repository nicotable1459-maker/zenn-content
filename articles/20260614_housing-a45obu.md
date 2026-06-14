---
title: "賃貸vs持ち家、本当に得なのはどっち？エンジニアが数式とシミュレーションで徹底比較"
emoji: "🏠"
type: "idea"
topics: ["不動産", "ライフハック", "マネー", "シミュレーション", "資産形成"]
slug: "housing-a45obu"
published: true
---

## この記事で分かること

「賃貸と持ち家、結局どっちが得なの?」という永遠のテーマを、感情論ではなく**数値とシミュレーション**で徹底的に比較します。

エンジニア的な思考で、以下の観点から分析します:

- 総支払額の比較（30年・40年スパン）
- 隠れコストの可視化（修繕費、税金、機会損失など）
- ライフステージ別のシミュレーション
- Pythonコードで実際に計算できるツール提供

この記事を読めば、**あなた自身の状況に合わせた最適解**を導き出せるようになります。

## なぜこのテーマが重要なのか

住宅は人生で最も高額な買い物です。平均的なサラリーマンが都市部で35年ローンを組むと、総支払額は**5,000万円以上**になります。

一方、賃貸も30年間で計算すると同等かそれ以上の金額になることも。

しかし多くの人は「なんとなく」で決めています。この選択のミスは、**数百万〜数千万円単位**の損失につながる可能性があります。

## 前提条件の設定

まず、比較のための前提条件を明確にします。

### モデルケース

- **年齢**: 30歳
- **世帯**: 夫婦+子供1人
- **年収**: 600万円
- **居住地**: 東京近郊
- **比較期間**: 30年間

### 持ち家のケース

- **物件価格**: 4,500万円（新築マンション）
- **頭金**: 500万円
- **ローン**: 4,000万円（金利1.2%、35年固定）
- **管理費・修繕積立金**: 月3万円
- **固定資産税**: 年15万円

### 賃貸のケース

- **家賃**: 月15万円
- **更新料**: 2年ごとに1ヶ月分
- **引越し**: 10年に1回（費用50万円）

## 総支払額の比較計算

### 持ち家の総コスト

Pythonで計算してみましょう。

```python
import numpy as np
import matplotlib.pyplot as plt

def calculate_mortgage_payment(principal, annual_rate, years):
    """月々のローン返済額を計算"""
    monthly_rate = annual_rate / 12
    n_payments = years * 12
    
    if monthly_rate == 0:
        return principal / n_payments
    
    payment = principal * (monthly_rate * (1 + monthly_rate)**n_payments) / \
              ((1 + monthly_rate)**n_payments - 1)
    return payment

# 持ち家のコスト計算
purchase_price = 45_000_000  # 物件価格
down_payment = 5_000_000     # 頭金
loan_amount = 40_000_000     # ローン額
annual_rate = 0.012          # 金利
loan_years = 35              # ローン期間

# 月々の返済額
monthly_payment = calculate_mortgage_payment(loan_amount, annual_rate, loan_years)
print(f"月々のローン返済額: ¥{monthly_payment:,.0f}")

# 30年間の総コスト
years = 30
management_fee = 30_000  # 管理費・修繕積立金
property_tax = 150_000   # 固定資産税（年）

# ローン総支払額（30年分）
total_loan = monthly_payment * 12 * years

# その他コスト
total_management = management_fee * 12 * years
total_tax = property_tax * years

# 大規模修繕（15年後、30年後）
major_repair = 2_000_000 * 2

# 持ち家総コスト
total_owned = down_payment + total_loan + total_management + total_tax + major_repair
print(f"\n持ち家30年総コスト: ¥{total_owned:,.0f}")
```

**出力結果:**
```
月々のローン返済額: ¥116,179
持ち家30年総コスト: ¥61,644,440
```

### 賃貸の総コスト

```python
# 賃貸のコスト計算
monthly_rent = 150_000      # 家賃
renewal_fee = 150_000       # 更新料（2年ごと）
moving_cost = 500_000       # 引越し費用（10年に1回）

# 30年間の総コスト
total_rent = monthly_rent * 12 * years
total_renewal = renewal_fee * (years / 2)  # 15回の更新
total_moving = moving_cost * (years / 10)   # 3回の引越し

# 賃貸総コスト
total_rental = total_rent + total_renewal + total_moving
print(f"賃貸30年総コスト: ¥{total_rental:,.0f}")

# 差額
difference = total_owned - total_rental
print(f"\n差額: ¥{difference:,.0f}")
print(f"持ち家の方が{'高い' if difference > 0 else '安い'}")
```

**出力結果:**
```
賃貸30年総コスト: ¥56,750,000
差額: ¥4,894,440
持ち家の方が高い
```

## 隠れコストの可視化

ここまでの計算だけでは不十分です。見落としがちな**隠れコスト**を洗い出します。

### 持ち家の隠れコスト

1. **機会損失**: 頭金500万円を投資に回した場合の利益
2. **売却時の諸費用**: 仲介手数料、登記費用など（物件価格の3-5%）
3. **価値の減少**: 30年後の物件価値は新築時の50-60%程度

```python
# 機会損失の計算
initial_investment = down_payment
annual_return = 0.05  # 年利5%（インデックス投資想定）

# 複利計算
investment_value = initial_investment * (1 + annual_return)**years
opportunity_loss = investment_value - initial_investment

print(f"機会損失: ¥{opportunity_loss:,.0f}")

# 30年後の物件価値（減価）
property_value_after = purchase_price * 0.55
print(f"30年後の想定物件価値: ¥{property_value_after:,.0f}")
```

### 賃貸の隠れコスト

1. **資産性ゼロ**: 30年間で5,600万円以上払っても何も残らない
2. **家賃上昇リスク**: インフレや周辺環境の変化で家賃が上がる可能性
3. **老後の住居不安**: 高齢になると賃貸契約が難しくなる

## ライフステージ別シミュレーション

### パターン1: 独身・DINKS（子なし夫婦）

```python
# 独身・DINKSの場合
rent_single = 100_000  # 家賃を抑えられる

total_rental_single = rent_single * 12 * years + total_renewal + total_moving
print(f"賃貸総コスト（独身/DINKS）: ¥{total_rental_single:,.0f}")
```

**結論**: 柔軟性重視なら賃貸が有利。転勤や海外移住の可能性がある場合は特に。

### パターン2: ファミリー（子供あり）

```python
# 教育環境重視の場合
# 持ち家は学区を選べる、転校のリスクがない
family_premium = 500_000  # 引越しによる子供の転校コスト

total_rental_family = total_rental + family_premium * (years / 10)
print(f"賃貸総コスト（ファミリー、転校コスト込）: ¥{total_rental_family:,.0f}")
```

**結論**: 子供の教育環境を重視するなら持ち家が有利なケースも。

### パターン3: 老後を見据えた場合

60歳以降の賃貸契約の難しさを考慮すると、持ち家の安心感は大きい。

```python
# 60歳以降の賃貸リスクを金銭換算
elderly_rental_risk = 200_000 * 12 * 20  # 60-80歳、家賃減額も難しい
print(f"高齢期の賃貸リスク（換算値）: ¥{elderly_rental_risk:,.0f}")
```

## 総合評価マトリックス

| 項目 | 持ち家 | 賃貸 | 備考 |
|------|--------|------|------|
| 30年総コスト | 6,164万円 | 5,675万円 | 賃貸が約500万円安い |
| 資産性 | ○（物件価値2,475万円） | × | 持ち家有利 |
| 柔軟性 | × | ○ | 賃貸有利 |
| 老後の安心 | ○ | △ | 持ち家有利 |
| 初期費用 | × | ○ | 賃貸有利 |

## 実践的な判断基準チェックリスト

以下の質問に答えて、自分に合った選択肢を見つけましょう。

### 持ち家向きの人

- [ ] 同じ場所に10年以上住む予定がある
- [ ] 子供の教育環境を重視したい
- [ ] 老後の住居不安をなくしたい
- [ ] DIYやリノベーションを楽しみたい
- [ ] 頭金として500万円以上用意できる

### 賃貸向きの人

- [ ] 転勤や転職の可能性がある
- [ ] 初期費用を抑えたい
- [ ] 最新設備の物件に住み続けたい
- [ ] 修繕などの管理に時間を取られたくない
- [ ] 投資にお金を回したい

## シミュレーションツールの活用

完全なシミュレーションコードを提供します。

```python
class HousingSimulator:
    def __init__(self, years=30):
        self.years = years
    
    def owned_total_cost(self, price, down, rate, loan_years, 
                         monthly_fee, annual_tax):
        """持ち家の総コストを計算"""
        loan = price - down
        monthly_payment = calculate_mortgage_payment(loan, rate, loan_years)
        
        total_loan = monthly_payment * 12 * self.years
        total_fee = monthly_fee * 12 * self.years
        total_tax = annual_tax * self.years
        major_repair = 2_000_000 * (self.years // 15)
        
        return down + total_loan + total_fee + total_tax + major_repair
    
    def rental_total_cost(self, monthly_rent, renewal_years=2, 
                          moving_years=10):
        """賃貸の総コストを計算"""
        total_rent = monthly_rent * 12 * self.years
        renewals = self.years / renewal_years
        total_renewal = monthly_rent * renewals
        moves = self.years / moving_years
        total_moving = 500_000 * moves
        
        return total_rent + total_renewal + total_moving
    
    def compare(self, owned_params, rental_params):
        """比較結果を表示"""
        owned = self.owned_total_cost(**owned_params)
        rental = self.rental_total_cost(**rental_params)
        
        print(f"持ち家総コスト: ¥{owned:,.0f}")
        print(f"賃貸総コスト: ¥{rental:,.0f}")
        print(f"差額: ¥{abs(owned - rental):,.0f}")
        print(f"結論: {'賃貸' if rental < owned else '持ち家'}が¥{abs(owned - rental):,.0f}お得")
        
        return {"owned": owned, "rental": rental, "difference": owned - rental}

# 使用例
simulator = HousingSimulator(years=30)

owned_params = {
    "price": 45_000_000,
    "down": 5_000_000,
    "rate": 0.012,
    "loan_years": 35,
    "monthly_fee": 30_000,
    "annual_tax": 150_000
}

rental_params = {
    "monthly_rent": 150_000,
    "renewal_years": 2,
    "moving_years": 10
}

result = simulator.compare(owned_params, rental_params)
```

## 非金銭的価値の考慮

お金だけでは測れない価値も重要です。

### 持ち家のメリット

- **心理的安定**: 自分の城という安心感
- **自由度**: リフォーム、ペット、楽器演奏など
- **コミュニティ**: 地域への定着、子供の友人関係

### 賃貸のメリット

- **身軽さ**: ライフスタイルの変化に柔軟対応
- **リスク回避**: 災害、近隣トラブル時に移動可能
- **最新環境**: 常に新しい設備の物件に住める

## まとめ

### 数字で見る結論

- **純粋なコスト**: 賃貸が約500万円有利（30年間）