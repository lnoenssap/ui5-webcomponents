const assert = require("assert");

describe("Input general interaction", () => {
	browser.url("http://localhost:8080/test-resources/sap/ui/webcomponents/main/pages/Input.html");

	it("fires change", () => {
		const input1 = browser.$("#input1").shadow$("input");
		const inputResult = browser.$("#inputResult").shadow$("input");

		// Start typing.
		input1.click();
		input1.keys("abc");

		// Click somewhere else to focus out - should fire change event.
		inputResult.click();

		// Get back and continue typing.
		input1.click();
		input1.keys("def");

		// Click somewhere else to force focus out - should fire change event.
		inputResult.click();

		assert.strictEqual(inputResult.getProperty("value"), "2", "change is called twice");
	});

	it("fires input", () => {
		const input2 = browser.$("#input2").shadow$("input");
		const inputLiveChangeResult = browser.$("#inputLiveChangeResult").shadow$("input");

		input2.click();
		input2.setValue("abc");

		assert.strictEqual(inputLiveChangeResult.getProperty("value"), "3", "input is fired 3 times");
	});

	it("fires change when same value typed, but value is mutated via API in between", () => {
		const inputChange = browser.$("#inputChange").shadow$("input");
		const inputChangeResult = browser.$("#inputChangeResult").shadow$("input");

		inputChange.click();
		inputChange.keys("abc");

		// The submit event listener mutates the value via the API
		// Note: along with the sumbit event - the first change event is fired.
		inputChange.keys("Enter");

		// Type the same value once again.
		inputChange.keys("abc");

		// Clicking on another input to force focus out,
		// which should trigger second change event, although same value is typed in.
		inputChangeResult.click();

		assert.strictEqual(inputChangeResult.getProperty("value"), "2", "change is called twice");
	});

	it("handles suggestions", () => {
		let item;
		const suggestionsInput = browser.$("#myInput").shadow$("input");
		const inputResult = browser.$("#inputResult").shadow$("input");
		const popover = browser.$("#myInput").shadow$("ui5-popover").shadow$(".ui5-popover-root");

		suggestionsInput.click();
		suggestionsInput.keys("p");

		assert.ok(popover.isDisplayedInViewport(), "suggestions are opened.");
		
		item = $("#myInput ui5-li:first-child");
		item.click();

		assert.ok(!popover.isDisplayedInViewport(), "suggestions are closed");
		assert.strictEqual(suggestionsInput.getProperty("value"), "Portugal", "First item has been selected");
		assert.strictEqual(inputResult.getProperty("value"), "1", "suggestionItemSelected event called once");

		suggestionsInput.keys("\b");
		item = $("#myInput ui5-li:first-child");
		item.click();

		assert.strictEqual(suggestionsInput.getProperty("value"), "Portugal", "First item has been selected again");
		assert.strictEqual(inputResult.getProperty("value"), "2", "suggestionItemSelected event called for second time");
	});

	it("handles suggestions via keyboard", () => {
		const suggestionsInput = browser.$("#myInput2").shadow$("input");
		const inputResult = browser.$("#inputResult").shadow$("input");

		suggestionsInput.click();
		suggestionsInput.keys("c");
		suggestionsInput.keys("ArrowDown");
		suggestionsInput.keys("Enter");

		assert.strictEqual(suggestionsInput.getProperty("value"), "Cozy", "First item has been selected");
		assert.strictEqual(inputResult.getProperty("value"), "3", "suggestionItemSelected event called once");

		suggestionsInput.keys("\b");
		suggestionsInput.keys("ArrowUp");
		suggestionsInput.keys("Space");

		assert.strictEqual(suggestionsInput.getProperty("value"), "Condensed", "First item has been selected");
		assert.strictEqual(inputResult.getProperty("value"), "4", "suggestionItemSelected event called once");
	});

	/*
	it("sets empty value to an input", () => {
		const input1 = browser.$("#input1");
		const innerInput = browser.$("#input1").shadow$("input");

		input1.setProperty("value", "");

		assert.strictEqual(input1.getProperty("value"), "", "Property value should be empty");
		assert.strictEqual(innerInput.getProperty("value"), "", "Inner's property value should be empty");
	});
	*/
});
