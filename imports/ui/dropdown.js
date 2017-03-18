import { $ } from 'meteor/jquery';

export default 1;
// TODO Kommentare
/*
  Mouseenter event that will show the informantions at the enter position (cursorposition)
*/

/*
Mouseleave event will delete the Dropdown if the mouse leave the zone again*/

export class Dropdown {
  style;
  html;
  // TODO Rework this style thing
  constructor(position, object) {
    this.style = {
      position: 'fixed',
      'z-index': 999,
      top: '10px',
      left: '10px',
      transform: `translate3d( ${position.clientX}px, ${position.clientY}px, 0px)`,
    };

    this.html = `<div class='dropdown_header'> ${object.name} </div><div class='description'> ${object.description} </div>`;
  }

  render() {
    $('#dropdown').html(`<div class="dropdown">${this.html}</div>`);
    $('#dropdown').css(this.style);
  }

  move(position) {
    this.style = {
      position: 'fixed',
      'z-index': 999,
      top: '10px',
      left: '10px',
      transform: `translate3d( ${position.clientX}px, ${position.clientY}px, 0px)`,
    };
    $('#dropdown').css(this.style);
  }

  static remove() {
    $('#dropdown').html('<!--PlaceHolder-->');
    $('#dropdown').removeAttr('style');
  }

}
