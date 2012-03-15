/**
 * @docauthor Jason Johnston <jason@sencha.com>
 *
 * A container for grouping sets of fields, rendered as a HTML `fieldset` element. The {@link #title}
 * config will be rendered as the fieldset's `legend`.
 *
 * While FieldSets commonly contain simple groups of fields, they are general {@link Ext.container.Container Containers}
 * and may therefore contain any type of components in their {@link #cfg-items}, including other nested containers.
 * The default {@link #layout} for the FieldSet's items is `'anchor'`, but it can be configured to use any other
 * layout type.
 *
 * FieldSets may also be collapsed if configured to do so; this can be done in two ways:
 *
 * 1. Set the {@link #collapsible} config to true; this will result in a collapse button being rendered next to
 *    the {@link #title legend title}, or:
 * 2. Set the {@link #checkboxToggle} config to true; this is similar to using {@link #collapsible} but renders
 *    a {@link Ext.form.field.Checkbox checkbox} in place of the toggle button. The fieldset will be expanded when the
 *    checkbox is checked and collapsed when it is unchecked. The checkbox will also be included in the
 *    {@link Ext.form.Basic#submit form submit parameters} using the {@link #checkboxName} as its parameter name.
 *
 * # Example usage
 *
 *     @example
 *     Ext.create('Ext.form.Panel', {
 *         title: 'Simple Form with FieldSets',
 *         labelWidth: 75, // label settings here cascade unless overridden
 *         url: 'save-form.php',
 *         frame: true,
 *         bodyStyle: 'padding:5px 5px 0',
 *         width: 550,
 *         renderTo: Ext.getBody(),
 *         layout: 'column', // arrange fieldsets side by side
 *         defaults: {
 *             bodyPadding: 4
 *         },
 *         items: [{
 *             // Fieldset in Column 1 - collapsible via toggle button
 *             xtype:'fieldset',
 *             columnWidth: 0.5,
 *             title: 'Fieldset 1',
 *             collapsible: true,
 *             defaultType: 'textfield',
 *             defaults: {anchor: '100%'},
 *             layout: 'anchor',
 *             items :[{
 *                 fieldLabel: 'Field 1',
 *                 name: 'field1'
 *             }, {
 *                 fieldLabel: 'Field 2',
 *                 name: 'field2'
 *             }]
 *         }, {
 *             // Fieldset in Column 2 - collapsible via checkbox, collapsed by default, contains a panel
 *             xtype:'fieldset',
 *             title: 'Show Panel', // title or checkboxToggle creates fieldset header
 *             columnWidth: 0.5,
 *             checkboxToggle: true,
 *             collapsed: true, // fieldset initially collapsed
 *             layout:'anchor',
 *             items :[{
 *                 xtype: 'panel',
 *                 anchor: '100%',
 *                 title: 'Panel inside a fieldset',
 *                 frame: true,
 *                 height: 52
 *             }]
 *         }]
 *     });
 */
Ext.define('Ext.form.FieldSet', {
    extend: 'Ext.container.Container',
    alias: 'widget.fieldset',
    uses: ['Ext.form.field.Checkbox', 'Ext.panel.Tool', 'Ext.layout.container.Anchor', 'Ext.layout.component.FieldSet'],

    /**
     * @cfg {String} title
     * A title to be displayed in the fieldset's legend. May contain HTML markup.
     */

    /**
     * @cfg {Boolean} [checkboxToggle=false]
     * Set to true to render a checkbox into the fieldset frame just in front of the legend to expand/collapse the
     * fieldset when the checkbox is toggled.. This checkbox will be included in form submits using
     * the {@link #checkboxName}.
     */

    /**
     * @cfg {String} checkboxName
     * The name to assign to the fieldset's checkbox if {@link #checkboxToggle} = true
     * (defaults to '[fieldset id]-checkbox').
     */

    /**
     * @cfg {Boolean} [collapsible=false]
     * Set to true to make the fieldset collapsible and have the expand/collapse toggle button automatically rendered
     * into the legend element, false to keep the fieldset statically sized with no collapse button.
     * Another option is to configure {@link #checkboxToggle}. Use the {@link #collapsed} config to collapse the
     * fieldset by default.
     */

    /**
     * @cfg {Boolean} collapsed
     * Set to true to render the fieldset as collapsed by default. If {@link #checkboxToggle} is specified, the checkbox
     * will also be unchecked by default.
     */
    collapsed: false,

    /**
     * @cfg {Boolean} [toggleOnTitleClick=true]
     * Set to true will add a listener to the titleCmp property for the click event which will execute the
     * {@link #toggle} method. This option is only used when the {@link #collapsible} property is set to true.
     */
    toggleOnTitleClick : true,

    /**
     * @property {Ext.Component} legend
     * The component for the fieldset's legend. Will only be defined if the configuration requires a legend to be
     * created, by setting the {@link #title} or {@link #checkboxToggle} options.
     */

    /**
     * @cfg {String} [baseCls='x-fieldset']
     * The base CSS class applied to the fieldset.
     */
    baseCls: Ext.baseCSSPrefix + 'fieldset',

    /**
     * @cfg {String} layout
     * The {@link Ext.container.Container#layout} for the fieldset's immediate child items.
     */
    layout: 'anchor',

    border: 1,

    componentLayout: 'fieldset',

    autoEl: 'fieldset',

    childEls: [
        'body'
    ],

    renderTpl: [
        '{%this.renderLegend(out,values);%}',
        '<div id="{id}-body" class="{baseCls}-body">',
            '{%this.renderContainer(out,values);%}',
        '</div>'
    ],

    stateEvents : [ 'collapse', 'expand' ],

    maskOnDisable: false,

    beforeDestroy: function(){
        var me = this,
            legend = me.legend;

        if (legend) {
            // get rid of the ownerCt since it's not a proper item
            delete legend.ownerCt;
            legend.destroy();
            me.legend = null;
        }
        me.callParent();
    },

    initComponent: function() {
        var me = this,
            baseCls = me.baseCls;

        me.callParent();

        me.addEvents(

            /**
             * @event beforeexpand
             * Fires before this FieldSet is expanded. Return false to prevent the expand.
             * @param {Ext.form.FieldSet} f The FieldSet being expanded.
             */
            "beforeexpand",

            /**
             * @event beforecollapse
             * Fires before this FieldSet is collapsed. Return false to prevent the collapse.
             * @param {Ext.form.FieldSet} f The FieldSet being collapsed.
             */
            "beforecollapse",

            /**
             * @event expand
             * Fires after this FieldSet has expanded.
             * @param {Ext.form.FieldSet} f The FieldSet that has been expanded.
             */
            "expand",

            /**
             * @event collapse
             * Fires after this FieldSet has collapsed.
             * @param {Ext.form.FieldSet} f The FieldSet that has been collapsed.
             */
            "collapse"
        );

        if (me.collapsed) {
            me.addCls(baseCls + '-collapsed');
            me.collapse();
        }
    },

    /**
     * Initialized the renderData to be used when rendering the renderTpl.
     * @return {Object} Object with keys and values that are going to be applied to the renderTpl
     * @private
     */
    initRenderData: function() {
        var data = this.callParent();

        data.baseCls = this.baseCls;

        return data;
    },

    getState: function () {
        var state = this.callParent();

        state = this.addPropertyToState(state, 'collapsed');

        return state;
    },

    afterCollapse: Ext.emptyFn,
    afterExpand: Ext.emptyFn,

    collapsedHorizontal: function () {
        return true;
    },

    collapsedVertical: function () {
        return true;
    },

    createLegendCt: function () {
        var me = this,
            items = [],
            legend = {
                xtype: 'container',
                baseCls: this.baseCls + '-header',
                id: me.id + '-legend',
                autoEl: 'legend',
                items: items,
                ownerCt: me,
                ownerLayout: me.componentLayout
            };

        // Checkbox
        if (me.checkboxToggle) {
            items.push(me.createCheckboxCmp());
        }
        // Toggle button
        else if (me.collapsible) {
            items.push(me.createToggleCmp());
        }

        // Title
        items.push(me.createTitleCmp());

        return legend;
    },

    /**
     * Creates the legend title component. This is only called internally, but could be overridden in subclasses to
     * customize the title component. If {@link #toggleOnTitleClick} is set to true, a listener for the click event
     * will toggle the collapsed state of the FieldSet.
     * @return Ext.Component
     * @protected
     */
    createTitleCmp: function() {
        var me  = this,
            cfg = {
                xtype : 'component',
                html  : me.title,
                cls   : me.baseCls + '-header-text',
                id    : me.id + '-legendTitle'
            };

        if (me.collapsible && me.toggleOnTitleClick) {
            cfg.listeners = {
                el : {
                    scope : me,
                    click : me.toggle
                }
            };
            cfg.cls += ' ' + me.baseCls + '-header-text-collapsible'
        }

        return (me.titleCmp = Ext.widget(cfg));
    },

    /**
     * @property {Ext.form.field.Checkbox} checkboxCmp
     * Refers to the {@link Ext.form.field.Checkbox} component that is added next to the title in the legend. Only
     * populated if the fieldset is configured with {@link #checkboxToggle}:true.
     */

    /**
     * Creates the checkbox component. This is only called internally, but could be overridden in subclasses to
     * customize the checkbox's configuration or even return an entirely different component type.
     * @return Ext.Component
     * @protected
     */
    createCheckboxCmp: function() {
        var me = this,
            suffix = '-checkbox';

        me.checkboxCmp = Ext.widget({
            xtype: 'checkbox',
            hideEmptyLabel: true,
            name: me.checkboxName || me.id + suffix,
            cls: me.baseCls + '-header' + suffix,
            id: me.id + '-legendChk',
            checked: !me.collapsed,
            listeners: {
                change: me.onCheckChange,
                scope: me
            }
        });
        return me.checkboxCmp;
    },

    /**
     * @property {Ext.panel.Tool} toggleCmp
     * Refers to the {@link Ext.panel.Tool} component that is added as the collapse/expand button next to the title in
     * the legend. Only populated if the fieldset is configured with {@link #collapsible}:true.
     */

    /**
     * Creates the toggle button component. This is only called internally, but could be overridden in subclasses to
     * customize the toggle component.
     * @return Ext.Component
     * @protected
     */
    createToggleCmp: function() {
        var me = this;
        me.toggleCmp = Ext.widget({
            xtype: 'tool',
            type: 'toggle',
            handler: me.toggle,
            id: me.id + '-legendToggle',
            scope: me
        });
        return me.toggleCmp;
    },

    doRenderLegend: function (out, renderData) {
        // Careful! This method is bolted on to the renderTpl so all we get for context is
        // the renderData! The "this" pointer is the renderTpl instance!

        var me = renderData.$comp,
            legend, tree;

        // Create the Legend component if needed
        if (me.title || me.checkboxToggle || me.collapsible) {
            me.legend = legend = Ext.widget(me.createLegendCt());

            legend.ownerLayout.configureItem(legend);
            tree = me.legend.getRenderTree();

            Ext.DomHelper.generateMarkup(tree, out);
        }
    },

    finishRender: function () {
        var legend = this.legend;

        this.callParent();

        if (legend) {
            legend.finishRender();
        }
    },

    getCollapsed: function () {
        return this.collapsed ? 'top' : false;
    },

    getCollapsedDockedItems: function () {
        var legend = this.legend;

        return legend ? [ legend ] : [];
    },

    /**
     * Sets the title of this fieldset
     * @param {String} title The new title
     * @return {Ext.form.FieldSet} this
     */
    setTitle: function(title) {
        var me = this,
            legend = me.legend;
            
        me.title = title;
        if (me.rendered) {
            if (!me.legend) {
                me.legend = legend = Ext.widget(me.createLegendCt());
                legend.ownerLayout.configureItem(legend);
                legend.render(me.el, 0);
            }
            me.titleCmp.update(title);
        }
        return me;
    },

    getTargetEl : function() {
        return this.body || this.frameBody || this.el;
    },

    getContentTarget: function() {
        return this.body;
    },

    /**
     * Expands the fieldset.
     * @return {Ext.form.FieldSet} this
     */
    expand : function(){
        return this.setExpanded(true);
    },

    /**
     * Collapses the fieldset.
     * @return {Ext.form.FieldSet} this
     */
    collapse : function() {
        return this.setExpanded(false);
    },

    /**
     * @private Collapse or expand the fieldset
     */
    setExpanded: function(expanded) {
        var me = this,
            checkboxCmp = me.checkboxCmp,
            operation = expanded ? 'expand' : 'collapse';

        if (!me.rendered || me.fireEvent('before' + operation, me) !== false) {
            expanded = !!expanded;

            if (checkboxCmp) {
                checkboxCmp.setValue(expanded);
            }

            if (expanded) {
                me.removeCls(me.baseCls + '-collapsed');
            } else {
                me.addCls(me.baseCls + '-collapsed');
            }
            me.collapsed = !expanded;
            if (me.rendered) {
                me.updateLayout();
                me.fireEvent(operation, me);
            }
        }
        return me;
    },
    
    getRefItems: function(deep) {
        var refItems = this.callParent(arguments),
            legend = this.legend;

        // Prepend legend items to ensure correct order
        if (legend) {
            refItems.unshift(legend);
            if (deep) {
                refItems.unshift.apply(refItems, legend.getRefItems(true));
            }
        }
        return refItems;
    },

    /**
     * Toggle the fieldset's collapsed state to the opposite of what it is currently
     */
    toggle: function() {
        this.setExpanded(!!this.collapsed);
    },

    /**
     * @private
     * Handle changes in the checkbox checked state
     */
    onCheckChange: function(cmp, checked) {
        this.setExpanded(checked);
    },

    setupRenderTpl: function (renderTpl) {
        this.callParent(arguments);

        renderTpl.renderLegend = this.doRenderLegend;
    }
});
