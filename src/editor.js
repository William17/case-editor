import $ from 'jquery';
import Adapter from './adapter/localStorageAdapter';
import Base from './base';

import CaseEditorFilesNav from './editor-files-nav';
import CaseEditorFilesContent from './editor-files-content';
import CaseEditorModal from './editor-modal';

import mainTemplate from './template/main.html'
import toolbarTemplate from './template/toolbar.html';

export default class CaseEditor extends Base {
  static Adapter = Adapter;
  static FilesNav = CaseEditorFilesNav;
  static FilesContent = CaseEditorFilesContent;
  static ObjModal = CaseEditorModal;

  constructor(el) {
    super();
    this.initAdapter();
    this.initDoms(el);
    this.initEvents();
    this.initStyles();
  }

  events = {
    openFile: function(id) {
      const adapter = this.adapter;
      const isOpened = adapter.state.openedIds.indexOf(id) > -1;
      if (!isOpened) {
        adapter.openObj(id, function(err, obj) {
          this.filesContent.emit('openFile', obj);
          this.filesContent.emit('activeFile', id);
          this.filesNav.emit('activeFile', id);
        }.bind(this));
      } else {
        adapter.activeObj(id, function(err, obj) {
          this.filesContent.emit('activeFile', id);
          this.filesNav.emit('activeFile', id);
        }.bind(this));
      }

    },
    closeFile: function(id) {
      this.adapter.closeObj(id, function(err, obj) {
        this.filesContent.emit('closeFile', id);
      }.bind(this));
    },

    fileChange: function(cm, changeObj) {
      const adapter = this.adapter;
      const obj = adapter.state.objs[cm.fileId];
      obj.content = cm.getValue();
      adapter.updateObj(obj);
    },

    createObj: function(obj) {
      const filesNav = this.filesNav;
      const modal = this.modal;
      this.adapter.createObj(obj, function(err, obj) {
          filesNav.emit('addObj', obj);
          modal.emit('hide');
      });
    },
    renameObj: function(obj) {
      const filesNav = this.filesNav;
      const filesContent = this.filesContent;
      const modal = this.modal;
      this.adapter.updateObj(obj, function(err, obj) {
        filesNav.emit('renameObj', obj);
        filesContent.emit('renameObj', obj);
        modal.emit('hide');
      });
    },
    deleteObj: function(id) {
      const filesNav = this.filesNav;
      const filesContent = this.filesContent;
      this.adapter.deleteObj(id, function(err, ids) {
        ids.forEach((id) => {
          filesNav.emit('deleteObj', id);
          filesContent.emit('deleteObj', id);
        });
      });
    }

  }

  initStyles() {
    require('normalize.css');
    require('./assets/fontello/css/fontello.css');
    require('./assets/style.less');
  }

  initAdapter() {
    this.adapter = new this.constructor.Adapter();
  }

  initDoms(el) {
    const $el = $(el);
    $el.html(this.mainTpl());
    $el.find('.tool-bar').html(this.toolbarTpl());
    const $filesNav = $el.find('.files-nav');
    const $filesContent = $el.find('.files-content');
    const $modal = $el.find('#obj-modal');
    this.filesNav = new this.constructor.FilesNav($filesNav, this);
    this.filesContent = new this.constructor.FilesContent($filesContent, this);
    this.modal = new this.constructor.ObjModal($modal, this);

    $el.find('.toggle-sidebar').click( () => {
      $el.toggleClass('hide-sidebar');
    });
  }

  mainTpl() {
    return mainTemplate;
  }

  toolbarTpl() {
    return toolbarTemplate;
  }

  setState(state) {
    this.adapter.updateState(state, function(err) {
      this.filesNav.emit('setState', state);
      this.filesContent.emit('setState', state);
    }.bind(this));
  }
}