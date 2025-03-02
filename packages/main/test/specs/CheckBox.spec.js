const assert = require('assert');

describe("CheckBox general interaction", () => {
	browser.url("http://localhost:8080/test-resources/sap/ui/webcomponents/main/pages/CheckBox.html");

	it("tests checked default value is false", () => {
		const checkBox = browser.$("#cb1");

		assert.strictEqual(checkBox.getProperty("checked"), false, "Check if default value for checked is false");
	});

	it("tests change event", () => {
		const checkBox = browser.$("#cb1");
		const field = browser.$("#field");

		checkBox.click();
		checkBox.keys("Space");
		checkBox.keys("Enter");

		assert.strictEqual(field.getProperty("value"), "3", "Select event should be fired 3 times");
	});

	it("tests change event not fired, when disabled", () => {
		const checkBox = browser.$("#cb2");
		const field = browser.$("#field");

		checkBox.click();
		checkBox.keys("Space");
		checkBox.keys("Enter");

		assert.strictEqual(field.getProperty("value"), "3", "Select event should not be called any more");
	});

	it("tests truncating and wrapping", () => {
		const CHECKBOX_DEFAULT_HEIGHT = 44;
		const truncatingCb = browser.$("#truncatingCb").shadow$(".ui5-checkbox-root");
		const wrappingCb = browser.$("#wrappingCb");

		const truncatingCbHeight = truncatingCb.getSize("height");
		const wrappingCbHeight = wrappingCb.getSize("height");

		assert.strictEqual(truncatingCbHeight, CHECKBOX_DEFAULT_HEIGHT, "The size of the checkbox is : " + truncatingCbHeight);
		assert.ok(wrappingCbHeight > CHECKBOX_DEFAULT_HEIGHT, "The size of the checkbox is more than: " + CHECKBOX_DEFAULT_HEIGHT);
	});
});
