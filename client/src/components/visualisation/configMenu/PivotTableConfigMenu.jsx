import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import SelectInput from './SelectInput';
import LabelInput from './LabelInput';
import Subtitle from './Subtitle';
import UniqueValueMenu from './UniqueValueMenu';
import ToggleInput from './ToggleInput';
import { canShowPivotTotals } from '../../../utilities/chart';

require('./PivotTableConfigMenu.scss');

// For now, we only support a subset of the regular aggregation options
const aggregationOptions = [
  {
    value: 'mean',
    labelId: 'mean',
  },
  {
    value: 'max',
    labelId: 'max',
  },
  {
    value: 'min',
    labelId: 'min',
  },
  {
    value: 'count',
    labelId: 'count',
  },
  {
    value: 'sum',
    labelId: 'sum',
  },
];

const getColumnTitle = (columnName, columnOptions = []) => {
  const entry = columnOptions.find(item => item.value === columnName);

  return entry ? entry.title : null;
};

const showValueDisplayInput = (spec) => {
  if (spec.aggregation !== 'count' && spec.aggregation !== 'sum') {
    return false;
  }

  if (spec.rowColumn === null || spec.categoryColumn === null) {
    return false;
  }

  return true;
};

export default class PivotTableConfigMenu extends Component {
  constructor() {
    super();
    this.state = {
      catValMenuCollapsed: true,
      rowValMenuCollapsed: true,
    };
  }

  render() {
    const {
      visualisation,
      onChangeSpec,
      columnOptions,
    } = this.props;
    const spec = visualisation.spec;

    return (
      <div className="PivotTableConfigMenu">
        <hr />
        <Subtitle><FormattedMessage id="aggregation" /></Subtitle>
        <div>
          <span
            className="aggregationInputContainer"
          >
            <SelectInput
              placeholderId="select_aggregation_method"
              labelTextId="aggregation_method"
              choice={spec.aggregation !== null ? spec.aggregation.toString() : null}
              name="aggregationMethod"
              options={aggregationOptions}
              disabled={spec.rowColumn == null || spec.categoryColumn == null}
              onChange={(value) => {
                const change = { aggregation: value };

                if (value === 'count') {
                  change.valueColumn = null;
                }
                onChangeSpec(change);
              }}
            />
            {spec.aggregation === 'count' &&
              (spec.rowColumn == null || spec.categoryColumn == null) &&
              <div
                className="helpText aggregationHelpText"
              >
                <div className="helpTextContainer">
                  <span className="alert">!</span>
                  <FormattedMessage id="pivot_help_text" />
                </div>
              </div>
            }
          </span>
          {spec.aggregation !== 'count' &&
            <div>
              <SelectInput
                placeholderId="select_a_value_column"
                labelText="value_column"
                choice={spec.valueColumn !== null ? spec.valueColumn.toString() : null}
                name="valueColumnInput"
                options={columnOptions.filter(option =>
                  option.type === 'number' || option.type === 'date')}
                onChange={value => onChangeSpec({
                  valueColumn: value,
                })}
                clearable
              />
              <div className="inputGroup">
                <label htmlFor="decimalPlacesInput">
                  <FormattedMessage id="number_of_decimal_places" />
                </label>
                <input
                  className="numberInput"
                  id="decimalPlacesInput"
                  type="number"
                  value={spec.decimalPlaces}
                  min={0}
                  max={16}
                  onChange={evt => onChangeSpec({
                    decimalPlaces: evt.target.value,
                  })}
                />
              </div>
            </div>
          }
          {showValueDisplayInput(spec) &&
            <SelectInput
              placeholderId="choose_how_cells_are_displayed"
              labelTextId="value_display"
              choice={spec.valueDisplay ? spec.valueDisplay : 'default'}
              name="valueDisplay"
              options={[
                {
                  value: 'default',
                  labelId: 'default',
                },
                {
                  value: 'percentageRow',
                  labelId: 'cell_as_percentage_of_row',
                },
                {
                  value: 'percentageColumn',
                  labelId: 'cell_as_percentage_of_column',
                },
                {
                  value: 'percentageTotal',
                  labelId: 'cell_as_percentage_of_table_total',
                },
              ]}
              onChange={value => onChangeSpec({
                valueDisplay: value,
              })}
            />
          }
          {canShowPivotTotals(spec) &&
            <div>
              <ToggleInput
                className="totalToggle"
                checked={spec.hideRowTotals !== true}
                labelId="show_row_totals"
                onChange={() => onChangeSpec({
                  hideRowTotals: !spec.hideRowTotals,
                })}
              />
              <ToggleInput
                className="totalToggle"
                checked={spec.hideColumnTotals !== true}
                labelId="show_column_totals"
                onChange={() => onChangeSpec({
                  hideColumnTotals: !spec.hideColumnTotals,
                })}
              />
            </div>
          }
        </div>
        <hr />
        <Subtitle><FormattedMessage id="columns" /></Subtitle>
        <SelectInput
          placeholderId="select_a_column"
          labelTextId="columns"
          choice={spec.categoryColumn !== null ? spec.categoryColumn.toString() : null}
          name="categoryColumnInput"
          options={columnOptions}
          onChange={(value) => {
            const change = { categoryColumn: value };

            if (value == null && spec.aggregation !== 'count') {
              change.aggregation = 'count';
              change.valueColumn = null;
            }
            if (value !== spec.categoryColumn) {
              change.categoryTitle = null;
              change.filters = spec.filters.filter(filter => filter.origin !== 'pivot-column');
            }
            onChangeSpec(change);
          }}
          clearable
        />
        {spec.categoryColumn !== null &&
          <div>
            <UniqueValueMenu
              tableData={visualisation.data}
              dimension="column"
              collapsed={this.state.catValMenuCollapsed}
              onChangeSpec={this.props.onChangeSpec}
              column={spec.categoryColumn}
              filters={spec.filters}
              toggleCollapsed={() =>
                this.setState({ catValMenuCollapsed: !this.state.catValMenuCollapsed })
              }
            />
            <LabelInput
              value={
                spec.categoryTitle == null ?
                  getColumnTitle(spec.categoryColumn, columnOptions)
                  :
                  spec.categoryTitle.toString()
              }
              placeholderId="columns_title"
              name="categoryTitle"
              onChange={event => onChangeSpec({
                categoryTitle: event.target.value.toString(),
              })}
            />
          </div>
        }
        <hr />
        <Subtitle><FormattedMessage id="rows" /></Subtitle>
        <SelectInput
          placeholderId="select_a_row_column"
          labelTextId="row_column"
          choice={spec.rowColumn !== null ? spec.rowColumn.toString() : null}
          name="rowColumnInput"
          options={columnOptions}
          onChange={(value) => {
            const change = { rowColumn: value };
            if (value == null && spec.aggregation !== 'count') {
              change.aggregation = 'count';
              change.valueColumn = null;
            }
            if (value !== spec.rowColumn) {
              change.rowTitle = null;
              change.filters = spec.filters.filter(filter => filter.origin !== 'pivot-row');
            }
            onChangeSpec(change);
          }}
          clearable
        />
        {spec.rowColumn !== null &&
          <div>
            <UniqueValueMenu
              tableData={visualisation.data}
              dimension="row"
              collapsed={this.state.rowValMenuCollapsed}
              onChangeSpec={this.props.onChangeSpec}
              column={spec.rowColumn}
              filters={spec.filters}
              toggleCollapsed={() =>
                this.setState({ rowValMenuCollapsed: !this.state.rowValMenuCollapsed })
              }
            />
            <LabelInput
              value={
                spec.rowTitle == null ?
                  getColumnTitle(spec.rowColumn, columnOptions)
                  :
                  spec.rowTitle.toString()
              }
              placeholderId="row_column_title"
              name="rowTitle"
              onChange={event => onChangeSpec({
                rowTitle: event.target.value.toString(),
              })}
            />
          </div>
        }
      </div>
    );
  }
}

PivotTableConfigMenu.propTypes = {
  visualisation: PropTypes.object.isRequired,
  datasets: PropTypes.object.isRequired,
  onChangeSpec: PropTypes.func.isRequired,
  columnOptions: PropTypes.array.isRequired,
  aggregationOptions: PropTypes.array.isRequired,
};
