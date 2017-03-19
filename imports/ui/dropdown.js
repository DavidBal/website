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

  // TODO Rework this style thing
  constructor(position, object) {
    this.style = {
      transform: `translate3d( ${position.clientX}px, ${position.clientY}px, 0px)`,
    };
    this.object = object;
  }

  renderDefault() {
    const html = `<div class='dropdown_header'> ${this.object.name} </div><div class='description'> ${this.object.description} </div>`;
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

  static interpretFact(factObject) {
    let factInfo = '';

    switch (factObject.type) {
      case 'Buff':
        factInfo = `${factObject.status}  (${factObject.duration}s)`;
        if (factObject.apply_count !== 1) {
          factInfo = `${factObject.apply_count} ${factInfo}`;
        }
        break;
      case 'AttributeAdjust':
        if (factObject.target === 'Healing') {
          factInfo = `${factObject.text}: ${factObject.value}`;
        } else {
          factInfo = `${factObject.target}: ${factObject.value}`;
        }
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
    const descriptionArray = this.object.description.split('.');
    const skillTyp = descriptionArray[0];
    let descriptionText = '';
    for (let t = 1; t < descriptionArray.length; t += 1) {
      descriptionText += `.${descriptionArray[t]}`;
    }
    let header = `<div class='dropdown_header'> ${this.object.name}`;
    const description = `<div class='description'><span class='skillTyp'>${skillTyp}</span>${descriptionText} </div>`;

    let facts = '<div class="facts">';
    for (let f = 0; f < this.object.facts.length; f += 1) {
      if (this.object.facts[f].type === 'Recharge') {
        header += `<div class="recharge"><div class="recharge_img backround_img" style="background-image: url('${this.object.facts[f].icon}')"></div><div class="">${this.object.facts[f].value}</div></div>`;
      } else {
        const factInfo = Dropdown.interpretFact(this.object.facts[f]);

        facts += `<div class="fact"><div class="fact_img backround_img" style="background-image: url('${this.object.facts[f].icon}')"></div><div class="">${factInfo}</div></div>`;
      }
    }
    facts += '</div>';
    header += '</div>';
    const html = `${header}${description}${facts}`;
    return html;
  }

  render() {
    let html;

    console.log(this.object);

    if (this.object.slot === 'Major' || this.object.slot === 'Minor') {
      html = this.renderTrait();
    } else if (this.object.type === 'Heal' || this.object.type === 'Utility' || this.object.type === 'Elite') {
      html = this.renderSkill();
    } else {
      html = this.renderDefault();
    }
    $('#dropdown').html(`<div class="dropdown">${html}</div>`);
    $('#dropdown').css(this.style);
  }

  move(position) {
    this.style = {
      transform: `translate3d( ${position.clientX}px, ${position.clientY}px, 0px)`,
    };
    $('#dropdown').css(this.style);
  }

  static remove() {
    $('#dropdown').html('<!--PlaceHolder-->');
    $('#dropdown').removeAttr('style');
  }

}
