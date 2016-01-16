import $ from 'jquery';
import Base from './base';
import { template } from './util';

import CodeMirror from 'codemirror';
import tabNavItemTemplate from './template/tab-nav-item.html';
import tabContentItemTemplate from './template/tab-content-item.html';

export default class CaseEditorFilesContent extends Base {
  static CodeMirror = CodeMirror;
  static cmOption= {
    common: {
      matchBrackets: true,
      lineNumbers: true,
      theme: 'dracula',
      keyMap: 'sublime'
    },
    highlights: [
      {
        test: /\.less$/,
        setting: {
          mode: 'text/x-less',
          theme: 'dracula'
        }
      },
      {
        test: /\.css$/,
        setting: {
          mode: 'text/css',
          theme: 'dracula'
        }
      },
      {
        test: /\.js$/,
        setting: {
          mode: 'application/javascript',
          theme: 'dracula'
        }
      },
      {
        test: /\.html$/,
        setting: {
          mode: 'text/html',
          theme: 'dracula'
        }
      }
    ]
  };

  events = {
    setState: function(state) {
      const openedIds = state.openedIds;
      const objs = state.objs;
      this.cmList.length = 0;
      this.$el.find('.tab-nav li').remove();
      this.$el.find('.tab-pane').remove();
      for (let id of openedIds) {
        this.emit('openFile', objs[id]);
      }
      this.emit('activeFile', state.activeId);
    },
    deleteObj: function(id) {
      this.$el.find('[data-obj-id="' + id + '"]').remove();
      this.cmList[id] = null;
    },
    activeFile: function(id){
      const $el = this.$el;
      $el.find('.tab-nav li[data-obj-id="' + id + '"]').addClass('active').siblings().removeClass('active')
      $el.find('.tab-content div.tab-pane[data-obj-id="' + id + '"]').show().siblings().hide();
    },
    openFile: function(obj) {
      const id = obj.id;
      const $el = this.$el;
      const editor = this.editor;
      this.$el.find('.tab-nav').append(this.tabNavItemTpl(obj));
      const $contentItem = $(this.tabContentItemTpl(obj));
      $el.find('.tab-content').append($contentItem);
      const cm = this.constructor.CodeMirror.fromTextArea($contentItem.find('textarea')[0], this.getCmOption(obj));
      cm.on('change', function(cm, changeObj) {
        editor.emit('fileChange', cm, changeObj);
      });
      cm.on("keyup",function(cm, event){
          const keyCode = event.keyCode;
          if(keyCode > 64 && keyCode < 91) {
            const mode = cm.getOption('mode');
            let hint = CodeMirror.hint.html;
            if(/\/css$/.test(mode)) {
               hint = CodeMirror.hint.css;
            } else if (/\/javascript$/.test(mode)) {
               hint = CodeMirror.hint.javascript;
            }
            cm.showHint({hint: hint, completeSingle: false, closeOnUnfocus: true});
          }
      });
      cm.fileId = id;
      this.cmList[id] = cm;
    },
    closeFile: function(id) {
      const $el = this.$el.find('[data-obj-id=' + id +']');
      const editor = this.editor;
      let activeId;
      let $activeEl = $el.prev();
      if (!$activeEl.length) {
        $activeEl = $el.next();
      }
      if ($activeEl.length) {
        activeId = $activeEl.data('obj-id');
      } else {
        activeId = editor.adapter.activeId;
      }
      editor.filesNav.emit('activeFile', activeId);
      editor.filesContent.emit('activeFile', activeId);
      $el.remove();
      this.cmList[id] = null;
    },
    renameObj: function(obj) {
      this.$el.find('[data-obj-id=' + obj.id +']>span').html(obj.name);
      this.setCmOption(obj, this.getCmOption(obj));
    }
  }

  constructor(el, editor) {
    super();
    this.$el = $(el);
    this.editor = editor;
    this.initDomEvents();
    this.initEvents();
    this.initCodeMirrorPlugin();
    // cache opened codemirror instance
    this.cmList = {};

    editor.adapter.ready(function (state) {
      this.emit('setState', state);
    }.bind(this));
  }

  initCodeMirrorPlugin() {
    require('codemirror/keymap/sublime.js');
    require('codemirror/addon/edit/matchbrackets');
    require('codemirror/addon/hint/show-hint');
    require('codemirror/addon/hint/show-hint.css');
    require('codemirror/addon/hint/html-hint');
    require('codemirror/addon/hint/css-hint');
    require('codemirror/addon/hint/javascript-hint');
    
    require('codemirror/mode/css/css');
    require('codemirror/mode/javascript/javascript');
    require('codemirror/mode/htmlmixed/htmlmixed');
    require('codemirror/lib/codemirror.css');
    require('codemirror/theme/dracula.css');
  }

  initDomEvents() {
    const $el = this.$el;
    const editor = this.editor;
    $el
      .delegate('.tab-nav li', 'click', function(event) {
        const id = $(event.currentTarget).data('obj-id');
        editor.filesNav.emit('activeFile', id);
        editor.filesContent.emit('activeFile', id);
      })
      .delegate('.tab-nav .icon-cancel', 'click', function(event) {
        const id = $(event.currentTarget).parent().data('obj-id');
        editor.emit('closeFile', id);
        return false;
      });
  }

  setCmOption (obj, options) {
    const cm = this.cmList[obj.id];
    if (cm) {
      for ( let key of Object.keys(options)) {
        cm.setOption(key, options[key]);
      }
    }
  }

  getCmOption (obj) {
    let setting = {};
    const cmOption = this.constructor.cmOption;
    const fileName = obj.name;
    cmOption.highlights.forEach((type) => {
      if(type.test.test(fileName)) {
        setting = type.setting;
        return;
      }
    });
    return $.extend({}, cmOption.common, setting);
  }

  tabNavItemTpl(data) {
    if (!this.tabNavItemTplComplied) {
      this.tabNavItemTplComplied = template(tabNavItemTemplate);
    }
    return this.tabNavItemTplComplied(data);
  }

  tabContentItemTpl(data) {
    if (!this.tabContentItemTplComplied) {
      this.tabContentItemTplComplied = template(tabContentItemTemplate);
    }
    return this.tabContentItemTplComplied(data);
  }
}