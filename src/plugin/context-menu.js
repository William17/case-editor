import $ from 'jquery';

export default class ContextMenu {

  static $contextmenu = $('<div />').css({position: 'fixed',display: 'none', 'box-shadow':'2px 3px 5px #ccc', 'z-index':999});
  static $triggerItem;
  static instances = {};
  static getInstanceId(){
    const id = Math.random();
    return this.instances[id] ? this.getInstanceId() : id;
  }
  static activeId;

  static onHide() {}
  static onShow() {}
  static create(options) {
    return new ContextMenu(options);
  }
  static INIT = false;
  static initialize() {
    $('body').append(this.$contextmenu);
    $(document).on('click contextmenu', function() {
      const activeInstance = this.instances[this.activeId];
      if(activeInstance) {
        this.$contextmenu.hide();
        this.$triggerItem = null;
        this.activeId = 0;
        if (typeof activeInstance.onHide === 'function') {
          activeInstance.onHide();
        }
        this.onHide();
      }
    }.bind(this));
  }

  constructor({ actions = {}, onShow, onHide, html ='', css = {}, className = '' }) {
    const ctor = this.constructor;
    this.onShow = onShow;
    this.onHide = onHide;
    this.actions = actions;
    // create menu element
    const id = ctor.getInstanceId();
    const $el = $('<div></div>').addClass(className).html(html);
    this.id = id;
    this.$el = $el;
    this.delegateEvents();
    // append to wrapper
    ctor.$contextmenu.css(css).append($el);
    ctor.instances[id] = this;
    if (!ctor.INIT) {
      ctor.initialize();
      ctor.INIT = true;
    }
  }

  show = (event) => {
    const ctor = this.constructor;
    this.$el.show().siblings().hide();
    ctor.$contextmenu.css({
      top: event.clientY,
      left: event.clientX,
      display: 'block'
    });
    ctor.activeId = this.id;
    ctor.$triggerItem = $(event.currentTarget);
    if (typeof this.onShow === 'function') {
      this.onShow(event);
    }
    return false;
  }

  insert() {
    if (!this.inserted) {
      this.inserted = true;
    }
  }

  delegateEvents() {
    this.$el.delegate('a', 'click', function(event) {
      const $target = $(event.currentTarget);
      const action = this.actions[$target.data('action')];
      if( typeof action === 'function') {
        action(this.constructor.$triggerItem, $target, event);
      }
    }.bind(this));
  }

  bind(ancestor, selector) {
    // lazy insert
    if (!this.inserted) {
      this.insert();
    }
    // bind event
    if (typeof selector === 'undefined') {
      $(ancestor).on('contextmenu', this.show);
    } else {
      $(ancestor).delegate(selector,'contextmenu',this.show);
    }
  }
  unbind(ancestor, selector) {
    if (typeof selector === 'undefined') {
      $(ancestor).off('contextmenu', this.show);
    } else {
      $(ancestor).undelegate(selector,'contextmenu',this.show);
    }
  }
}
$.ContextMenu = ContextMenu;