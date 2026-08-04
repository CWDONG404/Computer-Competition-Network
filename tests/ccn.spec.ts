import { expect, test } from "@playwright/test";

const routes = ["/", "/directory", "/calendar", "/directory/icpc", "/about"];
const viewports = [
  { width: 320, height: 760 },
  { width: 375, height: 812 },
  { width: 414, height: 896 },
  { width: 768, height: 1024 },
  { width: 1280, height: 900 }
];

for (const viewport of viewports) {
  test.describe(`${viewport.width}px`, () => {
    test.use({ viewport });
    for (const route of routes) {
      test(`${route} 无横向滚动且交互目标合格`, async ({ page }) => {
        const response = await page.goto(route, { waitUntil: "domcontentloaded" });
        expect(response?.ok(), `${route} 返回非 2xx`).toBeTruthy();
        const overflow = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth
        }));
        expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);

        const undersized = await page.locator("a[href], button, input, select, textarea, summary").evaluateAll((elements) => elements
          .filter((element) => {
            const style = getComputedStyle(element);
            const box = element.getBoundingClientRect();
            return style.display !== "none" && style.visibility !== "hidden" && box.width > 0 && box.height > 0;
          })
          .map((element) => {
            const box = element.getBoundingClientRect();
            return { tag: element.tagName, text: element.textContent?.trim().slice(0, 30), width: box.width, height: box.height };
          })
          .filter((box) => box.width < 44 || box.height < 44));
        expect(undersized, JSON.stringify(undersized)).toEqual([]);
      });
    }
  });
}

test("移动导航不重复，键盘焦点可见", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.locator(".desktop-nav")).toBeHidden();
  await expect(page.locator("#mobile-menu")).toBeHidden();
  await page.getByRole("button", { name: "打开菜单" }).click();
  await expect(page.locator("#mobile-menu")).toBeVisible();
  await expect(page.locator("#mobile-menu a")).toHaveCount(5);
  await page.keyboard.press("Escape");
  await expect(page.locator("#mobile-menu")).toBeHidden();
  await page.keyboard.press("Tab");
  const outline = await page.evaluate(() => {
    const focused = document.activeElement as HTMLElement;
    const style = getComputedStyle(focused);
    return { width: style.outlineWidth, style: style.outlineStyle };
  });
  expect(outline.style).not.toBe("none");
  expect(outline.width).not.toBe("0px");
});

test("搜索、旧参数与后台待审箱可用", async ({ page }) => {
  await page.goto("/");
  await page.locator("#home-search").fill("ICPC");
  await page.getByRole("button", { name: "搜索 120 条严选资料" }).click();
  await expect(page).toHaveURL(/\/directory\?q=ICPC/);
  await expect(page.getByRole("heading", { name: /ICPC/ }).first()).toBeVisible();

  await page.goto("/directory?audience=大学生&category=网络安全");
  await expect(page.locator(".active-filter", { hasText: "大学生" }).first()).toBeVisible();
  await expect(page.locator(".active-filter", { hasText: "网络安全" }).first()).toBeVisible();

  await page.goto("/admin/review");
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByLabel("管理员邮箱").fill("admin@ccn.test");
  await page.getByLabel("密码").fill("ccn-test-password");
  await page.getByRole("button", { name: "登录后台" }).click();
  await expect(page).toHaveURL(/\/admin$/ , { timeout: 10_000 });
  await page.goto("/admin/review");
  await expect(page.getByRole("heading", { name: "待审箱" })).toBeVisible();
  await expect(page.locator(".review-item").first()).toBeVisible();
});

test("后台发布必须绑定核验日期、官网来源与证据", async ({ page }) => {
  const title = "E2E 管理员发布约束测试";
  await page.goto("/admin/new");
  await page.getByLabel("管理员邮箱").fill("admin@ccn.test");
  await page.getByLabel("密码").fill("ccn-test-password");
  await page.getByRole("button", { name: "登录后台" }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 10_000 });
  await page.goto("/admin/new");

  await page.locator("#slug").fill("e2e-admin-source-check");
  await page.locator("#title").fill(title);
  await page.locator("#summary").fill("用于验证后台公开资料必须具备可追溯来源与证据。");
  await page.locator("#organizer").fill("CCN 测试编辑部");
  await page.locator("#official_url").fill("https://example.com/e2e-official");
  await page.locator("#source_url").fill("https://example.com/e2e-rules");
  await page.locator("#categories").fill("软件工程与开源");
  await page.locator("#recognition").fill("该测试条目只用于验证资料发布约束和来源关联。");
  await page.locator("#recommendation").fill("完成测试后立即删除，不进入正式收录目录。");
  await page.getByLabel("设为精选").check();
  await page.getByLabel("立即发布").check();
  await page.getByRole("button", { name: "创建条目" }).click();
  await expect(page.locator(".error-message")).toContainText("发布前必须填写核验日期");

  await page.locator("#verified_at").fill("2026-08-04");
  await page.getByLabel("公开排行或作品").check();
  await page.getByRole("button", { name: "创建条目" }).click();
  await expect(page).toHaveURL(/\/admin\?saved=1/);
  const article = page.locator("article").filter({ hasText: title });
  await expect(article).toContainText("已发布");
  page.once("dialog", (dialog) => dialog.accept());
  await article.getByRole("button", { name: "删除" }).click();
  await expect(page).toHaveURL(/\/admin\?deleted=1/);
});
