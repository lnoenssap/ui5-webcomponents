import litRender from "@ui5/webcomponents-base/dist/renderer/LitRenderer.js";
import RenderScheduler from "@ui5/webcomponents-base/dist/RenderScheduler.js";
import Integer from "@ui5/webcomponents-base/dist/types/Integer.js";
import FocusHelper from "@ui5/webcomponents-base/dist/FocusHelper.js";
import PopoverPlacementType from "./types/PopoverPlacementType.js";
import PopoverVerticalAlign from "./types/PopoverVerticalAlign.js";
import PopoverHorizontalAlign from "./types/PopoverHorizontalAlign.js";
import Popup from "./Popup.js";


// Template
import PopoverTemplate from "./generated/templates/PopoverTemplate.lit.js";

// Styles
import popoverCss from "./generated/themes/Popover.css.js";

/**
 * @public
 */
const metadata = {
	tag: "ui5-popover",
	properties: /** @lends sap.ui.webcomponents.main.Popover.prototype */ {

		/**
		 * Determines on which side the <code>ui5-popover</code> is placed at.
		 *
		 * @type {PopoverPlacementType}
		 * @defaultvalue "Right"
		 * @public
		 */
		placementType: {
			type: PopoverPlacementType,
			defaultValue: PopoverPlacementType.Right,
		},

		/**
		 * Determines the horizontal alignment of the <code>ui5-popover</code>.
		 *
		 * @type {PopoverHorizontalAlign}
		 * @defaultvalue "Center"
		 * @public
		 */
		horizontalAlign: {
			type: PopoverHorizontalAlign,
			defaultValue: PopoverHorizontalAlign.Center,
		},

		/**
		 * Determines the vertical alignment of the <code>ui5-popover</code>.
		 *
		 * @type {PopoverVerticalAlign}
		 * @defaultvalue "Center"
		 * @public
		 */
		verticalAlign: {
			type: PopoverVerticalAlign,
			defaultValue: PopoverVerticalAlign.Center,
		},

		/**
		 * Defines whether the <code>ui5-popover</code> should close when
		 * clicking/tapping outside of the popover.
		 * If enabled, it blocks any interaction with the background.
		 *
		 * @type {boolean}
		 * @defaultvalue false
		 * @public
		 */
		modal: {
			type: Boolean,
		},

		/**
		 * Determines whether the <code>ui5-popover</code> arrow is hidden.
		 *
		 * @type {boolean}
		 * @defaultvalue false
		 * @public
		 */
		noArrow: {
			type: Boolean,
		},

		/**
		 * Determines whether the <code>ui5-popover</code> would close upon user scroll.
		 *
		 * @type {boolean}
		 * @defaultvalue false
		 * @public
		 */
		stayOpenOnScroll: {
			type: Boolean,
		},

		/**
		 * Determines if there is no enough space, the <code>ui5-popover</code> can be placed
		 * over the target.
		 *
		 * @type {boolean}
		 * @defaultvalue false
		 * @public
		 */
		allowTargetOverlap: {
			type: Boolean,
		},

		_left: {
			type: Integer,
			noAttribute: true,
		},
		_top: {
			type: Integer,
			noAttribute: true,
		},

		_width: {
			type: String,
			noAttribute: true,
		},
		_height: {
			type: String,
			noAttribute: true,
		},

		_maxContentHeight: {
			type: Integer,
			noAttribute: true,
		},

		_arrowTranslateX: {
			type: Integer,
			defaultValue: 0,
			noAttribute: true,
		},

		_arrowTranslateY: {
			type: Integer,
			defaultValue: 0,
			noAttribute: true,
		},
		_actualPlacementType: {
			type: PopoverPlacementType,
			defaultValue: PopoverPlacementType.Right,
			noAttribute: true,
		},
		_focusElementsHandlers: {
			type: Object,
		},
	},
};

const diffTolerance = 32;
const dockInterval = 200;
const arrowSize = 8;

/**
 * @class
 *
 * <h3 class="comment-api-title">Overview</h3>
 *
 * The <code>ui5-popover</code> component displays additional information for an object
 * in a compact way and without leaving the page.
 * The Popover can contain various UI elements, such as fields, tables, images, and charts.
 * It can also include actions in the footer.
 *
 * <h3>Structure</h3>
 *
 * The popover has three main areas:
 * <ul>
 * <li>Header (optional) - with a back button and a title</li>
 * <li>Content - holds all the Web Component</li>
 * <li>Footer (optional) - with additional action buttons</li>
 * </ul>
 *
 * <b>Note:</b> The <code>ui5-popover</code> is closed when the user clicks
 * or taps outside the popover
 * or selects an action within the popover. You can prevent this with the
 * <code>modal</code> property.
 *
 * <h3>ES6 Module Import</h3>
 *
 * <code>import "@ui5/webcomponents/dist/Popover";</code>
 *
 * @constructor
 * @author SAP SE
 * @alias sap.ui.webcomponents.main.Popover
 * @extends Popup
 * @tagname ui5-popover
 * @public
 */
class Popover extends Popup {
	static get metadata() {
		return metadata;
	}

	static get render() {
		return litRender;
	}

	static get template() {
		return PopoverTemplate;
	}

	static get styles() {
		return [Popup.styles, popoverCss];
	}

	constructor() {
		super();

		this._documentMouseDownHandler = this.documentMouseDown.bind(this);

		const that = this;

		this._focusElementsHandlers = {
			forwardToFirst: event => {
				const firstFocusable = FocusHelper.findFirstFocusableElement(that);

				if (firstFocusable) {
					firstFocusable.focus();
				}
			},
			forwardToLast: event => {
				const lastFocusable = FocusHelper.findLastFocusableElement(that);

				if (lastFocusable) {
					lastFocusable.focus();
				}
			},
		};
	}

	isModal() {
		return this.modal;
	}

	static isInRect(x, y, rect) {
		return x >= rect.left && x <= rect.right
			&& y >= rect.top && y <= rect.bottom;
	}

	static getClientRect(domRef) {
		const rect = domRef.getBoundingClientRect();
		const computedStyle = window.getComputedStyle(domRef);

		const offsetLeft = parseFloat(computedStyle.paddingLeft);
		const offsetRight = parseFloat(computedStyle.paddingRight);
		const offsetTop = parseFloat(computedStyle.paddingTop);
		const offsetBottom = parseFloat(computedStyle.paddingBottom);

		return {
			left: rect.left + offsetLeft,
			right: rect.right - offsetRight,
			top: rect.top + offsetTop,
			bottom: rect.bottom - offsetBottom,
			width: rect.width - offsetLeft - offsetRight,
			height: rect.height - offsetTop - offsetBottom,
		};
	}

	hitTest(event) {
		const domRef = this.getPopupDomRef();
		const rect = domRef.getBoundingClientRect();
		let x,
			y;

		if (event.touches) {
			const touch = event.touches[0];
			x = touch.clientX;
			y = touch.clientY;
		} else {
			x = event.clientX;
			y = event.clientY;
		}

		// don't close the popover if the "initial focus" is outside the popover
		// and the user click/touch on it
		if (this.initialFocus && this._initialFocusDomRef) {
			const initialFocusRect = this._initialFocusDomRef.getBoundingClientRect();
			if (Popover.isInRect(x, y, initialFocusRect)) {
				return true;
			}
		}

		if (this._targetElement) {
			const targetElementRect = this._targetElement.getBoundingClientRect();
			if (Popover.isInRect(x, y, targetElementRect)) {
				return true;
			}
		}

		return Popover.isInRect(x, y, rect);
	}

	documentMouseDown(event) {
		if (!this.modal && !Popup.hitTest(this, event)) {
			this.close();
		}
	}

	checkDocking() {
		if (!this.stayOpenOnScroll && this.hasTargetElementMoved()) {
			this.close();
		}

		const popoverDomRef = this.getPopupDomRef();

		const popoverSize = {
			width: popoverDomRef.offsetWidth,
			height: popoverDomRef.offsetHeight,
		};

		const targetRect = Popover.getClientRect(this._targetElement);

		this.setLocation(targetRect, popoverSize);
	}

	getVerticalLeft(targetRect, popoverSize) {
		let left;

		switch (this.horizontalAlign) {
		case PopoverHorizontalAlign.Center:
		case PopoverHorizontalAlign.Stretch:
			left = targetRect.left - (popoverSize.width - targetRect.width) / 2;
			break;
		case PopoverHorizontalAlign.Left:
			left = targetRect.left;
			break;
		case PopoverHorizontalAlign.Right:
			left = targetRect.right - popoverSize.width;
			break;
		}

		return left;
	}

	getHorizontalTop(targetRect, popoverSize) {
		let top;

		switch (this.verticalAlign) {
		case PopoverVerticalAlign.Center:
		case PopoverVerticalAlign.Stretch:
			top = targetRect.top - (popoverSize.height - targetRect.height) / 2;
			break;
		case PopoverVerticalAlign.Top:
			top = targetRect.top;
			break;
		case PopoverVerticalAlign.Bottom:
			top = targetRect.bottom - popoverSize.height;
			break;
		}

		return top;
	}

	getActualPlacementType(targetRect, popoverSize) {
		const placementType = this.placementType;
		let actualPlacementType = placementType;

		const clientWidth = document.documentElement.clientWidth;
		const clientHeight = document.documentElement.clientHeight;

		switch (placementType) {
		case PopoverPlacementType.Top:
			if (targetRect.top < popoverSize.height
				&& targetRect.top < clientHeight - targetRect.bottom) {
				actualPlacementType = PopoverPlacementType.Bottom;
			}
			break;
		case PopoverPlacementType.Bottom:
			if (clientHeight - targetRect.bottom < popoverSize.height
				&& clientHeight - targetRect.bottom < targetRect.top) {
				actualPlacementType = PopoverPlacementType.Top;
			}
			break;
		case PopoverPlacementType.Left:
			if (targetRect.left < popoverSize.width
				&& targetRect.left < clientWidth - targetRect.right) {
				actualPlacementType = PopoverPlacementType.Right;
			}
			break;
		case PopoverPlacementType.Right:
			if (clientWidth - targetRect.right < popoverSize.width
				&& clientWidth - targetRect.right < targetRect.left) {
				actualPlacementType = PopoverPlacementType.Left;
			}
			break;
		}

		this._actualPlacementType = actualPlacementType;

		return actualPlacementType;
	}

	setLocation(targetRect, popoverSize) {
		let left = 0;
		let top = 0;
		const allowTargetOverlap = this.allowTargetOverlap;

		const clientWidth = document.documentElement.clientWidth;
		const clientHeight = document.documentElement.clientHeight;

		let maxHeight = clientHeight;

		let width = "";
		let height = "";

		const placementType = this.getActualPlacementType(targetRect, popoverSize);

		const isVertical = placementType === PopoverPlacementType.Top
			|| placementType === PopoverPlacementType.Bottom;

		if (this.horizontalAlign === PopoverHorizontalAlign.Stretch && isVertical) {
			popoverSize.width = targetRect.width;
			width = `${targetRect.width}px`;
		} else if (this.verticalAlign === PopoverVerticalAlign.Stretch && !isVertical) {
			popoverSize.height = targetRect.height;
			height = `${targetRect.height}px`;
		}

		this._width = width;
		this._height = height;

		const arrowOffset = this.noArrow ? 0 : arrowSize;

		// calc popover positions
		switch (placementType) {
		case PopoverPlacementType.Top:
			left = this.getVerticalLeft(targetRect, popoverSize);
			top = Math.max(targetRect.top - popoverSize.height - arrowOffset, 0);

			if (!allowTargetOverlap) {
				maxHeight = targetRect.top - arrowOffset;
			}
			break;
		case PopoverPlacementType.Bottom:
			left = this.getVerticalLeft(targetRect, popoverSize);

			if (allowTargetOverlap) {
				top = Math.max(Math.min(targetRect.bottom + arrowOffset, clientHeight - popoverSize.height), 0);
			} else {
				top = targetRect.bottom + arrowOffset;
				maxHeight = clientHeight - targetRect.bottom - arrowOffset;
			}
			break;
		case PopoverPlacementType.Left:
			left = Math.max(targetRect.left - popoverSize.width - arrowOffset, 0);
			top = this.getHorizontalTop(targetRect, popoverSize);
			break;
		case PopoverPlacementType.Right:
			if (allowTargetOverlap) {
				left = Math.max(Math.min(targetRect.left + targetRect.width + arrowOffset, clientWidth - popoverSize.width), 0);
			} else {
				left = targetRect.left + targetRect.width + arrowOffset;
			}

			top = this.getHorizontalTop(targetRect, popoverSize);
			break;
		}

		// correct popover positions
		if (isVertical) {
			if (popoverSize.width > clientWidth || left < 0) {
				left = 0;
			} else if (left + popoverSize.width > clientWidth) {
				left -= left + popoverSize.width - clientWidth;
			}
		} else {
			if (popoverSize.height > clientHeight || top < 0) { // eslint-disable-line
				top = 0;
			} else if (top + popoverSize.height > clientHeight) {
				top -= top + popoverSize.height - clientHeight;
			}
		}

		let maxContentHeight = Math.round(maxHeight);

		if (this.hasHeader) {
			const headerDomRef = this.getPopupDomRef().querySelector(".ui5-popup-header");
			if (headerDomRef) {
				maxContentHeight = Math.round(maxHeight - headerDomRef.offsetHeight);
			}
		}

		this._maxContentHeight = maxContentHeight;

		const arrowTranslateX = isVertical
			? targetRect.left + targetRect.width / 2 - left - popoverSize.width / 2 : 0;
		const arrowTranslateY = !isVertical
			? targetRect.top + targetRect.height / 2 - top - popoverSize.height / 2 : 0;

		this._arrowTranslateX = Math.round(arrowTranslateX);
		this._arrowTranslateY = Math.round(arrowTranslateY);

		if (this._left === undefined || Math.abs(this._left - left) > 1.5) {
			this._left = Math.round(left);
		}

		if (this._top === undefined || Math.abs(this._top - top) > 1.5) {
			this._top = Math.round(top);
		}
	}

	/**
	 * Opens the <code>Popover</code>.
	 * @param {object} control This is the component to which the
	 * <code>ui5-popover</code> will be placed.
	 * The side of the placement depends on the <code>placementType</code> property
	 * set in the <code>ui5-popover</code>.
	 * @public
	 */
	openBy(element) {
		if (this.opened) {
			return;
		}

		const cancelled = super.open();
		if (cancelled) {
			return true;
		}

		this.storeCurrentFocus();

		const targetDomRef = element;

		const popoverSize = this.getPopoverSize();
		const targetRect = Popover.getClientRect(targetDomRef);

		this._targetElement = targetDomRef;
		this._targetRect = targetRect;

		this.setLocation(targetRect, popoverSize);

		this.opened = true;

		setTimeout(_ => {
			if (this.opened) {
				this._dockInterval = setInterval(this.checkDocking.bind(this), dockInterval);
			}
		}, 0);

		setTimeout(_ => {
			if (this.opened) {
				document.addEventListener("mousedown", this._documentMouseDownHandler, true);
				document.addEventListener("touchstart", this._documentMouseDownHandler, true);
			}
		}, 0);
	}

	/**
	 * Closes the <code>ui5-popover</code>.
	 * @public
	 */
	close() {
		if (!this.opened) {
			return;
		}

		const cancelled = super.close();
		if (cancelled) {
			return;
		}

		this.opened = false;

		clearInterval(this._dockInterval);

		document.removeEventListener("mousedown", this._documentMouseDownHandler, true);
		document.removeEventListener("touchstart", this._documentMouseDownHandler, true);

		this.resetFocus();

		RenderScheduler.whenFinished()
			.then(_ => {
				this.fireEvent("afterClose", {});
			});
	}

	getPopoverSize() {
		const popoverFrameDomRef = this.shadowRoot.querySelector(".ui5-popup-frame"); // this.getDomRef();
		const popoverDomRef = popoverFrameDomRef.querySelector(".ui5-popover-root");

		popoverFrameDomRef.style.visibility = "hidden";
		popoverFrameDomRef.style.display = "block";

		const width = popoverDomRef.offsetWidth;
		const height = popoverDomRef.offsetHeight;

		popoverFrameDomRef.style.display = "";
		popoverFrameDomRef.style.visibility = "visible";

		return {
			width,
			height,
		};
	}

	hasTargetElementMoved() {
		const newRect = this._targetElement.getBoundingClientRect();
		const targetRect = this._targetRect;

		return Math.abs(newRect.left - targetRect.left) > diffTolerance
			|| Math.abs(newRect.top - targetRect.top) > diffTolerance;
	}

	get classes() {
		return {
			blockLayer: {
				"ui5-popup-BLy": true,
				"ui5-popup-blockLayer": true,
				"ui5-popup-blockLayer--hidden": !this.modal || this._hideBlockLayer,
			},
		};
	}

	get styles() {
		return {
			main: {
				left: `${this._left}px`,
				top: `${this._top}px`,
				width: this._width,
				height: this._height,
				"z-index": this._zIndex + 1,
			},
			content: {
				"max-height": `${this._maxContentHeight}px`,
			},
			arrow: {
				transform: `translate(${this._arrowTranslateX}px, ${this._arrowTranslateY}px)`,
			},
			blockLayer: {
				"z-index": this._zIndex,
			},
		};
	}

	get headerId() {
		return this.hasHeader ? `${this._id}-header` : undefined;
	}

	get focusHelper() {
		return {
			forwardToLast: this._focusElementsHandlers.forwardToLast,
			forwardToFirst: this._focusElementsHandlers.forwardToFirst,
		};
	}

	get role() {
		return "toolbar";
	}
}

Popover.define();

export default Popover;
