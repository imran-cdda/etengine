import { render } from "./src";

const template = `
<h1>{{ user.name|upper|truncate:8 }}</h1>
<p>Joined: {{ user.createdAt|formatDate:"en-GB" }}</p>
<ul>
{% for item in user.items %}
    {% if item.price < 100 %}
        <li>{{ item.name.second|truncate:15 }} — {{ item.price * item.quantity | formatUSD }}</li>
    {% endif %}
{% endfor %}
</ul>
`;

const ctx = {
  user: {
    name: "Md Imran Hossain",
    createdAt: "2025-10-21",
    items: [
      {
        name: {
          first: "Quran",
          second: "Translation with commentary",
        },
        price: 25,
      },
      { name: "Tafseer Book", price: 40, quantity: 2 },
    ],
  },
};

const html = render(template, ctx);

console.log(html);
