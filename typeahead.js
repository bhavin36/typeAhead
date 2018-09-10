/*!
 * Live data search
 * Bhavin Patel 2017
 */

(function ($, window, document) {
    var pluginName = "typeahead",
        defaults = {
            placeholderText: "type to search ....",
            editMode: true,
            minLength: 2,
            highlight: false,
            searchFn: null,
            listBuilderFn: null,
            itemSelectedFn: null,
            closedFn: null
        };

    function Plugin(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.$dropdown = null;
        this.$menu = null;
        this.timer = null;
        this.txtRecall = null;
        this.editMode = true;
        this.init();
    }

    Plugin.prototype = {
        init: function () {
            this.$element.attr({
                placeholder: this.editMode ? "" : this.options.placeholderText,
                autocomplete: "off",
                "data-typeahead": "on"
            });
            if (this.$element.closest(".s-typeahead").length === 0) {
                this.buildUi();
            }

            this.bindEvents();
        },
        buildUi: function () {
            var $parent = this.$element.parent();
            this.$element.detach();
            this.$dropdown = $("<div class='dropdown s-typeahead'>");
            this.editMode = this.options.editMode;
            var ig = $(
                '<div class="input-group">' +
                '  <div class="input-group-btn">' +
                '    <button type="button" class="btn btn-sm btn-default typeahead-close"><i class="fa fa-times"></i></button>   ' +
                '	  <button type="button" class="btn btn-sm btn-default typeahead-search" ><i class="fa fa-search"></i></button>' +
                "  </div>" +
                "</div>"
            );

            this.$element.insertBefore(ig.find(".input-group-btn"));
            this.$dropdown.append(ig);
            $parent.append(this.$dropdown);
            this.$menu = $("<ul class='dropdown-menu' style='max-height:300px; overflow:hidden;overflow-y:auto;overflow-x:hidden'>"
            );
            this.$dropdown.append(this.$menu);
            this.toggleEditMode(this.editMode);
        },
        bindEvents: function () {
            this.$element
                .on("keyup", $.proxy(this.startSearching, this))
                .on("click", this.show);
            this.$dropdown
                .on("click", "a.s-typeahead-link", $.proxy(this.select, this))
                .on("click", ".btn.typeahead-close", $.proxy(this.taCloseClicked, this))
                .on("click", ".btn.typeahead-search", $.proxy(this.taEditClicked, this));

            $(document).on("click", this.hide);
        },
        taEditClicked: function () {
            this.txtRecall = this.$element.val();
            this.$element.val("");
            this.$menu.empty();
            this.toggleEditMode(false);
        },
        taCloseClicked: function (event) {
            this.hide();
            var inEditMode = this.$element
                .closest(".input-group")
                .find(".btn.typeahead-search")
                .is(":visible") ||
                !this.editMode;
            if (inEditMode) {
                this.$element.val("");
            } else {
                this.$element.val(this.txtRecall);
            }

            this.$menu.empty();
            this.toggleEditMode(this.editMode);
            var closeFn = this.options.closedFn;
            if (closeFn) {
                closeFn(event, inEditMode);
            }
        },
        toggleEditMode: function (state) {
            this.$element
                .prop("readOnly", state)
                .attr("placeholder", state ? "" : this.options.placeholderText)
                .closest(".input-group")
                .find(".btn.typeahead-search")
                .toggleClass("hidden", !state);
        },
        startSearching: function () {
            //e.preventDefault();
            //e.stopPropagation();
            if (this.$element.attr("readonly")) {
                return;
            }
            clearTimeout(this.timer);
            this.timer = setTimeout($.proxy(function () {this.search();}, this),500);
        },
        select: function (event) {
            this.hide();
            if (this.editMode) {
                this.toggleEditMode(true);
            }
            var selFn = this.options.itemSelectedFn;
            if (selFn) {
                this.$element.val("");
                selFn($(event.currentTarget));
            }
        },
        search: function () {
            var $ta = this.$element,
                $dd = $ta.closest(".s-typeahead"),
                $dm = $dd.find(".dropdown-menu"),
                str = $ta.val(),
                currentLength = str.length;

            if (currentLength === 0 || currentLength < this.options.minLength) {
                $dd.removeClass("open");
                $dm.empty();
                return;
            }

            var that = this;
            this.options
                .searchFn(str)
                .done(function (searchData) {
                    var dMenu = ["<li class=\"dropdown-header\">" + searchData.length + " results found for search term <strong>\""
                            + str + "\"</strong></li>"
                    ],
                        parent = $dm.parent();
                    $dm.detach();
                    $dm.empty();
                    if (searchData.length > 0) {
                        dMenu.push("<li role='separator' class='divider'></li>");
                    }
                    if (that.options.listBuilderFn) {
                        dMenu.push.apply(dMenu, that.options.listBuilderFn(searchData));
                    }
                    dMenu = dMenu.map(function (item) {
                        var $itm = $(item);
                        var forHighlightTag = $itm
                            .find("a")
                            .css("white-space", "normal")
                            .attr("role", "button")
                            .addClass("s-typeahead-link")
                            .find("[data-for-highlight]")
                            .eq(0);

                        if (that.options.highlight) {
                            forHighlightTag.html(that.highlight(str, forHighlightTag.text()));
                        }

                        return $itm[0].outerHTML;
                    });
                    if (dMenu.length === 0)
                        dMenu.push("<li class='dropdown-header'><a>No matching result found.</a></li>");
                    parent.append($dm.append(dMenu.join("")));
                    $dd.dropdown();
                    $dd.addClass("open");
                })
                .fail(function () {
                    var parent = $dm.parent();
                    $dm.detach();
                    $dm.empty();
                    parent.append($dm.append("<li class='dropdown-header'><a>No matching result found.</a></li>"));
                    $dd.dropdown();
                    $dd.addClass("open");
                });
        },
        highlight: function (searchStr, value) {
            var pattern = new RegExp("(" + searchStr + ")", "gi");
            return value.replace(pattern, "<mark>$1</mark>");
        },
        hide: function (event) {
            $("input[data-typeahead='on']").each(function () {
                var $this = $(this),
                    $dd = $this.closest(".s-typeahead");
                if (event && $.contains($dd[0], event.target)) return;
                $dd.removeClass("open");
            });
        },
        show: function (event) {
            var $this = $(event.target);
            var $dd = $this.closest(".s-typeahead"),
                $txt = $dd.find("input");
            if (!$txt.attr("readonly") && $txt.val() && $dd.find(".dropdown-menu> li").length >= 1)
                $dd.addClass("open");
        },
        destroy: function () {
            clearTimeout(this.timer);
            var $dd = this.$element
                .removeData("plugin_" + pluginName)
                .val("")
                .prop("readonly", false)
                .off("keyup click typeahead.close")
                .removeAttr("data-selected-value data-selected-value-2 data-typeahead")
                .closest(".s-typeahead");
            $dd.parent().append(this.$element);
            this.$element.removeAttr("placeholder");
            $dd.remove();
        }
    };

    $.fn[pluginName] = function (option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data("plugin_" + pluginName);
            var options = typeof option == "object" && option;

            if (!data && /destroy|hide/.test(option)) return;
            if (!data)
                $this.data("plugin_" + pluginName, (data = new Plugin(this, options)));
            if (typeof option == "string") data[option]();
        });
    };
})(jQuery, window, document);