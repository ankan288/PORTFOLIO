import json, re

with open(r'C:\Users\kinga\.gemini\antigravity-ide\brain\a62b9a60-5e27-460a-9d79-408bec6a7ef4\browser\scratchpad_bundvppk.md', 'r', encoding='utf-8') as f:
    content = f.read()

match = re.search(r'```json\n(.*?)\n```', content, re.DOTALL)
if match:
    data = json.loads(match.group(1))
    
    js_code = 'export const badges = [\n'
    for b in data:
        name = b['name'].replace("'", "\\'")
        issuer = b['issuer'].replace("'", "\\'")
        img = b['image_url']
        if not img:
            img = 'https://picsum.photos/500/500'
        link = b.get('badge_link', 'https://www.credly.com/users/ankan-ghosh08')
        js_code += f"  {{ name: '{name}', issuer: '{issuer}', image: '{img}', link: '{link}' }},\n"
    js_code += '];\n'
    
    with open('src/badges.js', 'w', encoding='utf-8') as out:
        out.write(js_code)
    print('Created src/badges.js with exact links')
else:
    print('Could not parse JSON')
