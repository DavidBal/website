import { $ } from 'meteor/jquery';

export default 1;
// TODO Kommentare
/*
  Mouseenter event that will show the informantions at the enter position (cursorposition)
*/

/*
Mouseleave event will delete the Dropdown if the mouse leave the zone again*/

export class Dropdown {
  object;
  style;
  positionX;

  // DONE Rework this style thing
  constructor(position, object) {
    this.style = {
      transform: `translate3d( ${position.clientX}px, ${position.clientY}px, 0px)`,
    };
    this.object = object;
    this.positionX = position.clientX;
  }

  renderDefault() {
    const html = `<div class='dropdown_header'> ${this.object.name} </div><div class='description'> ${this.object.description} <br/> DEFAULT RENDER </div>`;
    return html;
  }

  renderTrait() {
    let facts = '<div class="facts">';
    let header = `<div class="dropdown_header"> ${this.object.name}`;
    if (typeof this.object.facts !== 'undefined') {
      for (let f = 0; f < this.object.facts.length; f += 1) {
        if (this.object.facts[f].type === 'Recharge') {
          header += `<div class="recharge"><div class="recharge_img backround_img" style="background-image: url('${this.object.facts[f].icon}')"></div><div class="">${this.object.facts[f].value}s</div></div>`;
        } else {
          const factInfo = Dropdown.interpretFact(this.object.facts[f]);

          facts += `<div class="fact"><div class="fact_img backround_img" style="background-image: url('${this.object.facts[f].icon}')"></div><div class="">${factInfo}</div></div>`;
        }
      }
    }
    header += '</div>';
    facts += '</div>';
    const html = `${header}<div class='description'> ${this.object.description} </div>${facts}`;
    return html;
  }

  /*
    This function create out of a FactObject a Fact String for dipslaying to the User
    factObject -
    return String with Facts
  */
  static interpretFact(factObject) {
    let factInfo = '';

    switch (factObject.type) {
      case 'AttributeAdjust':
        if (factObject.target === 'Healing') {
          factInfo = `${factObject.text}: ${factObject.value}`;
        } else {
          factInfo = `${factObject.target}: ${factObject.value}`;
        }
        break;
      case 'Buff':
        factInfo = `${factObject.status}  (${factObject.duration}s)`;
        if (factObject.apply_count !== 1 && factObject.apply_count !== 0) {
          factInfo = `${factObject.apply_count} ${factInfo}`;
        }
        break;
      case 'BuffConversion':
        factInfo = `Gain ${factObject.target} based on ${factObject.source}: ${factObject.percent}%`;
        break;
      case 'ComboField':
        factInfo = `${factObject.field_type}`;
        break;
      case 'ComboFinisher':
        factInfo = `${factObject.finisher_type}`;
        if (factObject.percent !== 100) {
          factInfo += ` : ${factObject.percent}%`;
        }
        break;
      case 'Damage':
        // TODO deeper Work needed
        factInfo = `${factObject.hit_count} Ziele`;
        break;
      case 'Distance':
        factInfo = `${factObject.text}: ${factObject.distance}`;
        break;
      case 'Duration':
        factInfo = `${factObject.text} (${factObject.duration}s)`;
        break;
      case 'Heal':
        factInfo = `${factObject.text}: ${factObject.hit_count} Verbündete-Ziele`;
        break;
      case 'HealingAdjust':
        factInfo = `${factObject.text}: ${factObject.hit_count} Verbündete-Ziele`;
        break;
      case 'NoData':
        factInfo = `${factObject.text}`;
        break;
      case 'Number':
        factInfo = `${factObject.text} : ${factObject.value}`;
        break;
      case 'Percent':
        factInfo = `${factObject.text} ${factObject.percent}%`;
        break;
      case 'PrefixedBuff':
        factInfo = `${factObject.status}  (${factObject.duration}s)`;
        if (factObject.apply_count !== 1) {
          factInfo = `${factObject.apply_count} ${factInfo}`;
        }
        factInfo = `<div class="fact_img backround_img" style="background-image: url('${factObject.prefix.icon}')"></div>${factInfo}`;
        break;
      case 'Radius':
        factInfo = `${factObject.text}: ${factObject.distance}`;
        break;
      case 'Range':
        factInfo = `${factObject.text}: ${factObject.value}`;
        break;
      case 'Recharge':
        // Wird schon vorher abgefangen da es im Header dargestellt wird
        break;
      case 'Time':
        factInfo = `${factObject.text}: ${factObject.duration}s`;
        break;
      case 'Unblockable':
        factInfo = `${factObject.text}`;
        break;
      default:
        factInfo = 'Konnte nicht ausgewertet werden!!';
    }

    return factInfo;
  }

  renderSkill() {
    // Split description to extract the Skill Typ
    const descriptionArray = this.object.description.split('.');
    const skillTyp = descriptionArray[0];
    let descriptionText = '';
    // Set the rest back together
    for (let t = 1; t < descriptionArray.length; t += 1) {
      descriptionText += `.${descriptionArray[t]}`;
    }
    let header = `<div class='dropdown_header'> ${this.object.name}`;
    const description = `<div class='description'><span class='skillTyp'>${skillTyp}</span>${descriptionText} </div>`;

    let facts = '<div class="facts">';
    for (let f = 0; f < this.object.facts.length; f += 1) {
      if (this.object.facts[f].type === 'Recharge') {
        // Add Recharge if the this Skill has one
        header += `<div class="recharge"><div class="recharge_img backround_img" style="background-image: url('${this.object.facts[f].icon}')"></div><div class="">${this.object.facts[f].value}</div></div>`;
      } else {
        const factInfo = Dropdown.interpretFact(this.object.facts[f]);

        facts += `<div class="fact"><div class="fact_img backround_img" style="background-image: url('${this.object.facts[f].icon}')"></div><div class="">${factInfo}</div></div>`;
      }
    }
    facts += '</div>';
    header += '</div>';

    return `${header}${description}${facts}`;
  }

  render() {
    let html;

    // console.log(this.object);
    // console.log(this.positionX + 200);
    // console.log($(window).width());
    // Find out wich render function need to been called
    if (this.object.slot === 'Major' || this.object.slot === 'Minor') {
      html = this.renderTrait();
    } else if (this.object.type === 'Heal' || this.object.type === 'Utility' || this.object.type === 'Elite') {
      html = this.renderSkill();
    } else {
      // Should not be called
      html = this.renderDefault();
    }
    if ((this.positionX + 290) > $(window).width()) {
      $('#dropdown').css('left', -280);
    } else {
      $('#dropdown').css('left', 10);
    }
    $('#dropdown').html(`<div class="dropdown">${html}</div>`);
    $('#dropdown').css(this.style);
  }

  move(position) {
    this.style = {
      transform: `translate3d( ${position.clientX}px, ${position.clientY}px, 0px)`,
    };
    if ((position.clientX + 290) > $(window).width()) {
      $('#dropdown').css('left', -280);
    } else {
      $('#dropdown').css('left', 10);
    }
    $('#dropdown').css(this.style);
  }

  static remove() {
    $('#dropdown').html('<!--PlaceHolder-->');
    $('#dropdown').removeAttr('style');
  }

}
