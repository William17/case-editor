import $ from 'jquery';
import Base from './base';
import './plugin/context-menu';
import { objToList, listToTree, template } from './util';

import treeTemplate from './template/tree.html';
import objTemplate from './template/obj.html';

import contextMenuFileTemplate from './template/context-menu-file.html';
import contextMenuFolderTemplate from './template/context-menu-folder.html';
import contextMenuSidebarTemplate from './template/context-menu-sidebar.html';

export default class CaseEditorFilesNav extends Base{
  events = {
    setState: function(state) {
      this.$el.html(
        this.treeTpl(
          listToTree(objToList(state.objs), {idKey: 'id', parentKey: 'parent'})
        )
      );
      this.emit('activeFile', state.activeId);
    },
    deleteObj: function(id) {
      this.$el.find('[data-obj-id=' + id +']').parent().remove();
    },
    addObj: function(obj) {
      let $el = this.$el;
      if (obj.parent) {
        $el = $el.find('[data-obj-id=' + obj.parent +']').parent();
      } 
      $el.find('.files-tree:eq(0)>ul').append(this.objTpl(obj));
    },
    activeFile: function(id){
      let $el = this.$el, $item;
      $el.find('a').each(function() {
        $item = $(this);
        if ($item.data('obj-id') == id) {
          $item.addClass('active');
        } else {
          $item.removeClass('active');
        }
      });
    },
    renameObj: function(obj) {
      this.$el.find('[data-obj-id=' + obj.id +']>span').html(obj.name);
    }
  }

  constructor(el, editor) {
    super();
    const $el = $(el);
    const adapter = editor.adapter;
    this.$el = $el;
    this.editor = editor;
    this.initDomEvents();
    this.initContextMenu();
    this.initEvents();
    adapter.ready(function (state) {
      this.emit('setState', state);
    }.bind(this));
  }

  initDomEvents() {
    const editor = this.editor;
    const $el = this.$el;
    $el
      .delegate('a.file', 'contextmenu', (event) =>{
        const id = $(event.currentTarget).data('obj-id');
        editor.filesNav.emit('activeFile', id);
        editor.filesContent.emit('activeFile', id);
      })
      .delegate('a.file', 'click', (event) => {
        const id = $(event.currentTarget).data('obj-id');
        editor.emit('openFile', id);
      })
      .delegate('a.folder', 'contextmenu', (event) =>{
        editor.filesNav.emit('activeFile', $(event.currentTarget).data('obj-id'));
      })
      .delegate('a.folder', 'click', (event) => {
        // slide effect
        // using js since the container dosen't have a cerntain height
        const $item = $(event.currentTarget).parent();
        const $subItemUl = $item.find('ul:eq(0)');
        const stateActiveId = editor.adapter.state.activeId;
        if ( !$subItemUl.is(':hidden') ) {
          $item.addClass('collapse');
          $subItemUl.find('a').removeClass('active');
          $subItemUl.slideUp();
        } else {
          $item.removeClass('collapse');
          // weird jquery slideDown
          // it will init the item a height of 0.x
          // but the item's final height may be 0
          if ($subItemUl.children().length>0) {
            $subItemUl.slideDown({
              complete: function() {
                editor.emit('activeFile', stateActiveId);
              }
            });
          } else {
            $subItemUl.show();
            editor.filesNav.emit('activeFile', stateActiveId);
            editor.filesContent.emit('activeFile', stateActiveId);
          }
        }
      });
  }

  initContextMenu() {
    const editor = this.editor;
    const adapter = editor.adapter;
    const $el = this.$el;
    $.ContextMenu.onHide = function(){
      const id = adapter.state.activeId;
      editor.filesNav.emit('activeFile', id);
      editor.filesContent.emit('activeFile', id);
    };

    $.ContextMenu
      .create({
        actions:{
          download: ($triggerItem) => {
            const obj = adapter.state.objs[$triggerItem.data('obj-id')];
            const el = document.createElement('a');
            el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(obj.content || ''));
            el.setAttribute('download', obj.name);
            el.click();
          },
          delete: ($triggerItem) => {
            editor.emit('deleteObj', $triggerItem.data('obj-id'));
          },
          rename: ($triggerItem) => {
            editor.modal.emit('show', adapter.state.objs[$triggerItem.data('obj-id')]);
          }
        },
        html:this.ctxMenuFileTpl()
      })
      .bind($el, '.file');

    // folder context menu
    $.ContextMenu
      .create({
        actions:{
          newFile: ($triggerItem) => {
            editor.modal.emit('show', {
              type:1,
              parent: $triggerItem.data('obj-id')
            });
          },
          newFolder: ($triggerItem) => {
            editor.modal.emit('show', {
              type:2,
              parent: $triggerItem.data('obj-id')
            });
          },
          deleteFolder: ($triggerItem) => {
            editor.emit('deleteObj', $triggerItem.data('obj-id'));
          },
          rename: ($triggerItem) => {
            editor.modal.emit('show', adapter.state.objs[$triggerItem.data('obj-id')]);
          }
        },
        html: this.ctxMenuFolderTpl()
      })
      .bind($el, '.folder');

    // sidebar context menu
    $.ContextMenu
      .create({
        actions:{
          newFile: ($triggerItem) => {
            editor.modal.emit('show',{
              type:1,
              parent: $triggerItem.data('obj-id')
            });
          },
          newFolder: ($triggerItem) => {
            editor.modal.emit('show',{
              type:2,
              parent: $triggerItem.data('obj-id')
            });
          }
        },
        html:this.ctxMenuSidebarTpl()
      })
      .bind($el);
  }

  objTpl(data) {
    if (!this.objTplComplied) {
      this.objTplComplied = template(objTemplate);
    }
    return this.objTplComplied(data);
  }
  treeTpl(data) {
    const thisTpl = template(treeTemplate);
    // recusive
    return thisTpl({tree: data, thisTpl: thisTpl});
  }
  ctxMenuFileTpl(data) {
    return template(contextMenuFileTemplate, data);
  }
  ctxMenuFolderTpl(data) {
    return template(contextMenuFolderTemplate, data);
  }
  ctxMenuSidebarTpl(data) {
    return template(contextMenuSidebarTemplate, data);
  }
}