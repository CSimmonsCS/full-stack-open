const { test, describe, expect, beforeEach } = require("@playwright/test");
const { loginWith, createNote } = require("./helper");

describe("Note app", () => {
  beforeEach(async ({ page, request }) => {
    await request.post("/api/testing/reset");
    await request.post("/api/users", {
      data: {
        username: "Christian",
        name: "Christian",
        password: "Christian",
      },
    });
    await page.goto("http://localhost:5173");
  });

  test("front page can be opened", async ({ page }) => {
    const locator = await page.getByText("Notes");
    await expect(locator).toBeVisible();
    await expect(
      page.getByText(
        "Note app, Department of Computer Science, University of Helsinki 2025"
      )
    ).toBeVisible();
  });

  test("login form can be opened", async ({ page }) => {
    await loginWith(page, "Christian", "Christian");

    await expect(page.getByText("Christian logged in")).toBeVisible();
  });

  test("login fails with wrong password", async ({ page }) => {
    await loginWith(page, "Christian", "wrong");

    const errorDiv = await page.locator(".error");
    await expect(errorDiv).toContainText("Wrong credentials");
    await expect(errorDiv).toHaveCSS("border-style", "solid");
    await expect(errorDiv).toHaveCSS("color", "rgb(255, 0, 0)");
    await expect(page.getByText("Christian logged in")).not.toBeVisible();
  });

  describe("when logged in", () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, "Christian", "Christian");
    });

    test("a new note can be created", async ({ page }) => {
      await createNote(page, "a note created by playwright");
      await expect(
        page.getByText("a note created by playwright")
      ).toBeVisible();
    });

    describe("and a note exists", () => {
      beforeEach(async ({ page }) => {
        await createNote(page, "first note");
        await createNote(page, "second note");
        await createNote(page, "third note");
      });

      test("importance can be changed", async ({ page }) => {
        await page.pause();
        const otherNoteText = await page.getByText("second note");
        const otherNoteElement = await otherNoteText.locator("..");

        await otherNoteElement
          .getByRole("button", { name: "make not important" })
          .click();
        await expect(
          otherNoteElement.getByText("make important")
        ).toBeVisible();
      });
    });
  });
});
