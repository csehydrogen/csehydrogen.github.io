// TODO multiple recipes?
class Helper {
  async FetchMarket(query, first_category = 0) {
    // div class="list__grade" > span class="name" > 개나리버섯
    // div class="list__grade" > span class="count" > [<em>10개 단위</em> 판매] // optional
    // div class="list__detail" > table > tbody > tr > td > div class="price" > <em>1</em> // 최저가
    //                                               > td > div class="price" > <em>-</em> // 전일 평균 거래가
    //                                               > td > div class="price" > <em>1</em> // 최근 구매가
    const db = {};
    for (let page = 1; ; ++page) {
      const url = `https://m-lostark.game.onstove.com/Market/List_v2?firstCategory=${first_category}&secondCategory=0&characterClass=&tier=0&grade=99&itemName=${encodeURIComponent(query)}&pageSize=10&pageNo=${page}&isInit=false&sortType=7`;
      const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
      const txt = await res.text()
      const dom = new DOMParser().parseFromString(txt, "text/html");
      const lis = dom.getElementsByTagName('li');
      console.log(`query=${query}, first_category=${first_category}, page=${page}, length=${lis.length}`);
      for (const li of lis) {
        const names = Array.prototype.map.call(li.getElementsByClassName('name'), x => x.innerText);
        const counts = Array.prototype.map.call(li.getElementsByClassName('count'), x => parseFloat(x.innerText.match(/\[(\d+)개/)[1]));
        const prices = Array.prototype.map.call(li.getElementsByClassName('price'), x => parseFloat(x.innerText));
        if (counts.length == 0) counts.push(1);
        if (names.length != 1 || counts.length != 1 || prices.length != 3) console.error("length mismatch");
        db[names[0]] = {unit: counts[0], lowest_price: prices[0], yesterday_average_price: prices[1], recent_price: prices[2]};
      }
      if (lis.length < 10) break;
    }
    return db;
  }
  async FetchSingleCraftClass(recipes, craftclass) {
    const url = `https://lostark.inven.co.kr/dataninfo/craft/?craftclass=${encodeURIComponent(craftclass)}`;
    const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
    const txt = await res.text()
    const dom = new DOMParser().parseFromString(txt, "text/html");
    const names = Array.prototype.map.call(dom.getElementsByClassName('name'), x => x.innerText);
    const detail_infos = Array.prototype.map.call(dom.getElementsByClassName('detail_info'), x => x.innerText);
    const golds = Array.prototype.map.call(dom.getElementsByClassName('price'), x => x.innerText);
    console.log(names);
    console.log(detail_infos);
    console.log(golds);
    names.push(null); // sentinel
    let i = 0, j = 0, k = 0;
    while (names[i]) {
      const name = names[i++];
      const recipe = {};
      recipe.ingredients = [];
      while (true) {
        const match = names[i] && names[i].match(/\n(.+?)\s+x\s+(\d+)\n/);
        if (!match) break;
        recipe.ingredients.push({name: match[1], count: parseFloat(match[2])});
        ++i;
      }
      const match = detail_infos[j++].match(/간\]\s([\d:]*)\[제.*\]\s(\d+)/);
      if (match) {
        recipe.time = match[1];
        recipe.energy = parseFloat(match[2]);
      }
      const gold_match = golds[k++].match(/골드 x (\d+)/);
      if (gold_match) {
        recipe.gold = parseFloat(gold_match[1]);
      }
      recipes[name] = recipe;
    }
    if (detail_infos.length != j || golds.length != k) console.error("length mismatch");
  }
  async FetchAllCraftClasses() {
    const ids = [30411, 30200, 33200, 20101, 30700, 31002];
    const recipes = {};
    for (const id of ids) {
      await this.FetchSingleCraftClass(recipes, id);
      console.log(id, 'done');
    }
    return recipes;
  }
  async FetchCSV() {
    const res = await fetch('recipes.csv');
    const txt = await res.text()
    return txt;
  }
  RecipesToCSV(recipes) {
    const EmptyIfNull = x => x ? x : '';
    const tokens = [];
    for (const [name, recipe] of Object.entries(recipes)) {
      tokens.push(`${name}`);
      tokens.push(`,${EmptyIfNull(recipe.type)}`);
      tokens.push(`,${EmptyIfNull(recipe.count)}`);
      tokens.push(`,${EmptyIfNull(recipe.exp)}`);
      tokens.push(`,${EmptyIfNull(recipe.time)}`);
      tokens.push(`,${EmptyIfNull(recipe.energy)}`);
      tokens.push(`,${EmptyIfNull(recipe.gold)}`);
      for (const ingredient of recipe.ingredients) {
        tokens.push(`,${ingredient.name},${ingredient.count}`);
      }
      tokens.push('\n');
    }
    return tokens.join('');
  }
  CSVToRecipes(csv) {
    const recipes = {};
    const lines = csv.split('\n');
    for (const line of lines) {
      const tokens = line.split(',');
      const ingredients = [];
      for (let i = 7; i < tokens.length; i += 2) {
        if (!tokens[i]) break;
        ingredients.push({name: tokens[i], count: parseFloat(tokens[i + 1])});
      }
      const name = tokens[0];
      recipes[name] = {
        type: tokens[1],
        count: parseFloat(tokens[2]),
        exp: parseFloat(tokens[3]),
        time: tokens[4],
        energy: parseFloat(tokens[5]),
        gold: parseFloat(tokens[6]),
        ingredients: ingredients
      };
    }
    return recipes;
  }
}

function FilterUnique(value, index, self) {
  return self.indexOf(value) === index;
}

const api = new Helper();
//const recipes = await api.FetchAllCraftClasses();
//const csv = api.RecipesToCSV(recipes);
//console.log(csv);
const csv = await api.FetchCSV();
const recipes = api.CSVToRecipes(csv);
console.log("레시피", recipes);

const db = {};
for (let [name, recipe] of Object.entries(recipes)) {
  // FIXME 융화 재료 레시피 여러 종류인 것 예외 처리
  if (name.includes("융화 재료")) name = name.slice(0, -1);
  db[name] = {};
  for (const ingredient of recipe.ingredients) {
    db[ingredient.name] = {};
  }
}

function FillDB(db, market_info) {
  for (const key in market_info) {
    if (key in db && !db[key].valid) {
      db[key] = market_info[key];
      db[key].valid = true;
    } else {
      //console.log(`MISS ${key}`)
    }
  }
}

function CheckDB(db) {
  for (const key in db) {
    if (!db[key].valid) {
      console.log(`매물 없음 : ${key}`)
      db[key].valid = false;
    }
  }
}

// target
FillDB(db, await api.FetchMarket("융화", 50000)); // 강화재료-전체
FillDB(db, await api.FetchMarket("", 60000)); // 전투용품-전체
FillDB(db, await api.FetchMarket("일품", 70000)); // 요리-전체
// ingredient
FillDB(db, await api.FetchMarket("", 90000)); // 생활-전체
CheckDB(db);

function AfterFee(price) {
  return price - (price == 1 ? 0 : Math.ceil(price / 20));
}

// TODO automate this...
function foo(metric) {
  function bar(target_name, target_unit, recipe_name, recipe_unit) {
    const target_price = db[target_name][metric];
    const recipe_price = db[recipe_name][metric];
    const buy_gold = recipe_price / db[recipe_name].unit * recipe_unit / target_unit * db[target_name].unit;
    const sell_gold = AfterFee(target_price);
    const instant_sell_gold = AfterFee(target_price - 1);
    const desc = `${recipe_name} ${db[recipe_name][metric]}G 구매 -> ${target_name} ${db[target_name][metric]}G 판매 (${buy_gold.toFixed(1)}G -> ${sell_gold}G)`;
    if (buy_gold < instant_sell_gold) {
      console.log('즉시 이득 :', desc);
    } else if (buy_gold < sell_gold) {
      console.log('이득 :', desc);
    } else {
      console.log('손해 :', desc);
    }
  }
  console.log('======== 영지 아비트라지 ========')
  bar('철광석', 50, '묵직한 철광석', 25);
  bar('철광석', 50, '단단한 철광석', 5);
  bar('목재', 50, '부드러운 목재', 25);
  bar('목재', 50, '튼튼한 목재', 5);

  function bar2(powder, src_list, dst_list) {
    for (const [dst_name, dst_unit] of dst_list) {
      for (const [src_name, src_unit] of src_list) {
        const buy_gold = db[src_name][metric] / db[src_name].unit * src_unit / 80 * 100 / dst_unit * db[dst_name].unit;
        const sell_gold = AfterFee(db[dst_name][metric]);
        const instant_sell_gold = AfterFee(db[dst_name][metric] - 1);
        const desc = `${src_name} ${db[src_name][metric]}G 구매 -> ${powder} -> ${dst_name} ${db[dst_name][metric]}G 판매 (${buy_gold.toFixed(1)}G -> ${sell_gold}G)`;
        if (buy_gold < instant_sell_gold) {
          console.log('즉시 이득 :', desc);
        } else if (buy_gold < sell_gold) {
          console.log('이득 :', desc);
        } else {
          console.log('손해 :', desc);
        }
      }
    }
  }
  console.log('======== 대도시 [생활의 재료 교환] 아비트라지 ========')
  bar2('채집의 가루', [
    ['들꽃', 100],
    ['수줍은 들꽃', 50],
    ['투박한 버섯', 100],
    ['싱싱한 버섯', 50],
  ], [
    ['수줍은 들꽃', 50],
    ['화사한 들꽃', 10],
    ['싱싱한 버섯', 50],
    ['화려한 버섯', 10],
  ]);
  bar2('벌목의 가루', [
    ['목재', 100],
    ['부드러운 목재', 50],
  ], [
    ['부드러운 목재', 50],
    ['튼튼한 목재', 10],
  ]);
  bar2('채광의 가루', [
    ['철광석', 100],
    ['묵직한 철광석', 50],
  ], [
    ['묵직한 철광석', 50],
    ['단단한 철광석', 10],
  ]);
  bar2('수렵의 가루', [
    ['두툼한 생고기', 100],
    ['다듬은 생고기', 50],
    ['질긴 가죽', 50],
  ], [
    ['다듬은 생고기', 50],
    ['질긴 가죽', 50],
    ['칼다르 두툼한 생고기', 10],
    ['오레하 두툼한 생고기', 10],
  ]);
  bar2('낚시의 가루', [
    ['생선', 100],
    ['붉은 살 생선', 50],
    ['자연산 진주', 50],
  ], [
    ['붉은 살 생선', 50],
    ['자연산 진주', 50],
    ['칼다르 태양 잉어', 10],
    ['오레하 태양 잉어', 10],
  ]);
  bar2('고고학의 가루', [
    ['고대 유물', 100],
    ['희귀한 유물', 50],
  ], [
    ['희귀한 유물', 50],
    ['칼다르 유물', 10],
    ['오레하 유물', 10],
  ]);
}

// buff
// 제작 시간 감소
// 제작 활동력 소모량 감소
// 제작 수수료
// 제작 대성공
// 분류별 제작 시간 감소, 제작 활동력 소모량 감소, 수수료 감소, 대성공
// 분류 = 특수, 배틀아이템-물약, 배틀아이템-폭탄, 배틀아이템-수류탄, 배틀아이템-로브
// 배틀아이템-기타, 요리, 
const buff = {}
buff.base = {'time': 0.03, 'energy': 0.03, 'gold': 0.02, 'bonus': 0.02};
buff['배틀 아이템 - 물약'] = {'time': 0.00, 'energy': 0.00, 'gold': 0.00, 'bonus': 0.00};
buff['배틀 아이템 - 폭탄'] = {'time': 0.03, 'energy': 0.01, 'gold': 0.00, 'bonus': 0.00};
buff['배틀 아이템 - 수류탄'] = {'time': 0.00, 'energy': 0.00, 'gold': 0.00, 'bonus': 0.00};
buff['배틀 아이템 - 로브'] = {'time': 0.00, 'energy': 0.00, 'gold': 0.00, 'bonus': 0.00};
buff['배틀 아이템 - 기타'] = {'time': 0.00, 'energy': 0.00, 'gold': 0.00, 'bonus': 0.00};
buff['요리'] = {'time': 0.00, 'energy': 0.00, 'gold': 0.00, 'bonus': 0.00};
buff['특수'] = {'time': 0.00, 'energy': 0.00, 'gold': 0.00, 'bonus': 0.00};

function CalculateProfit(metric) {
  const recipe_profit = [];
  for (let [name, recipe] of Object.entries(recipes)) {
    // FIXME 융화 재료 레시피 여러 종류인 것 예외 처리
    if (name.includes("융화 재료")) name = name.slice(0, -1);
    if (!db[name].valid) continue;
    let time_reduction = 0;
    let energy_reduction = 0;
    let gold_reduction = 0;
    let bonus_prob = 0;
    if (recipe.type in buff) {
      time_reduction = buff.base.time + buff[recipe.type].time;
      energy_reduction = buff.base.energy + buff[recipe.type].energy;
      gold_reduction = buff.base.gold + buff[recipe.type].gold;
      bonus_prob = buff.base.bonus + buff[recipe.type].bonus;
    } else {
      console.log(`WARN no recipe type for ${name}`);
    }

    let desc = '';
    let cost_per_recipe = Math.floor(recipe.gold * (1 - gold_reduction));
    desc += `${cost_per_recipe}G`;
    for (const ingredient of recipe.ingredients) {
      if (db[ingredient.name].valid) {
        const cost = db[ingredient.name][metric] / db[ingredient.name].unit * ingredient.count
        cost_per_recipe += cost;
        desc += `+${ingredient.name} ${ingredient.count}개 ${cost.toFixed(1)}G`;
      } else {
        cost_per_recipe += Infinity;
        desc += `+${ingredient.name} 매물없음`;
      }
    }
    desc += `=${name} ${recipe.count}개 ${cost_per_recipe.toFixed(1)}G`;
    const count_with_bonus = recipe.count * (1.05 * (1 + bonus_prob)); // 기본 5%에 곱연산
    const cost_per_market = cost_per_recipe / count_with_bonus * db[name].unit;
    const energy_per_market = recipe.energy * (1 - energy_reduction) / count_with_bonus * db[name].unit; 
    const market_price = AfterFee(db[name][metric]);
    const profit_per_kenergy = (market_price - cost_per_market) / energy_per_market * 1000;
    desc += `, 거래소 1묶음(${db[name].unit}개) 제작 ${cost_per_market.toFixed(1)}G 판매 ${market_price}G 에너지 ${energy_per_market.toFixed(1)}`;
    if (profit_per_kenergy)
      recipe_profit.push([profit_per_kenergy, name, desc]);
  }
  recipe_profit.sort((x, y) => y[0] - x[0]);
  return recipe_profit;
}

console.log('lowest_price', CalculateProfit('lowest_price'));
console.log('yesterday_average_price', CalculateProfit('yesterday_average_price'));
console.log('recent_price', CalculateProfit('recent_price'));

foo('lowest_price');