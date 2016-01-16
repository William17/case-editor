import $ from 'jquery';
import { template } from './util';
import Base from './base';
import './plugin/jquery-modal/jquery.modal.min.js';
import './plugin/jquery-modal/jquery.modal.css';

import objModalTemplate from './template/obj-modal.html';

export default class CaseEditorModal extends Base {

  events = {
    show: function(obj) {
      this.$el.html(this.objModalTpl(obj)).modal({
        showClose: false
      });
    },
    hide: function() {
      $.modal.close();
    }
  }

  constructor(el, editor) {
    super();
    this.$el = $(el);
    this.editor = editor;
    this.initEvents();
    this.initDomEvents();
  }

  initDomEvents() {
    const editor = this.editor;
    const $el = this.$el;
    $el
      .delegate('form', 'submit', function(event) {
        const obj = {
          id:$el.find('input[name="id"]').val(),
          type: $el.find('input[name="type"]').val(),
          parent: $el.find('input[name="parent"]').val(),
          name: $el.find('input[name="name"]').val()
        }
        if (!obj.id) {
          editor.emit('createObj', obj);
        } else {
          // rename
          editor.emit('renameObj', obj);
        }
        return false;
      })
      .delegate('.cancel', 'click', function() {
        editor.modal.emit('hide');
      });
  }

  objModalTpl(data) {
    return template(objModalTemplate, data);
  }

}