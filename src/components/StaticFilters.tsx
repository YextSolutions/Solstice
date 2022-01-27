import { useAnswersActions, useAnswersState, Filter, Matcher } from '@yext/answers-headless-react';
import { CompositionMethod, useComposedCssClasses } from '../hooks/useComposedCssClasses';
import { isDuplicateFilter } from '../utils/filterutils';
import CheckboxOption, { CheckboxOptionCssClasses } from './CheckboxOption';

//prettier-ignore
interface FilterOption {
  fieldId: string,
  value: string,
  label: string
}

//prettier-ignore
interface StaticFiltersProps {
  filterConfig: {
    options: FilterOption[],
    title: string
  }[],
  customCssClasses?: StaticFiltersCssClasses,
  cssCompositionMethod?: CompositionMethod
}

//prettier-ignore
interface StaticFiltersCssClasses extends CheckboxOptionCssClasses {
  container?: string,
  title?: string,
  optionsContainer?: string,
  divider?: string
}

//prettier-ignore
const builtInCssClasses: StaticFiltersCssClasses = {
  container: 'md:w-40',
  title: 'text-gray-900 text-sm font-medium mb-4',
  optionsContainer: 'flex flex-col space-y-3'
}

export default function StaticFilters(props: StaticFiltersProps): JSX.Element {
  const answersActions = useAnswersActions();
  const { filterConfig, customCssClasses, cssCompositionMethod } = props;
  const cssClasses = useComposedCssClasses(builtInCssClasses, customCssClasses, cssCompositionMethod);

  const selectableFilters = useAnswersState((state) => state.filters.static);
  const getOptionSelectStatus = (option: FilterOption): boolean => {
    const foundFilter = selectableFilters?.find((storedSelectableFilter) => {
      const { selected, ...storedFilter } = storedSelectableFilter;
      const targetFilter = {
        fieldId: option.fieldId,
        matcher: Matcher.Equals,
        value: option.value,
      };
      return isDuplicateFilter(storedFilter, targetFilter);
    });
    return !!foundFilter && foundFilter.selected;
  };

  const handleFilterOptionChange = (option: Filter, isChecked: boolean) => {
    answersActions.resetFacets();
    answersActions.setFilterOption({ ...option, selected: isChecked });
    answersActions.executeVerticalQuery();
  };

  return (
    <div className={cssClasses.container}>
      {filterConfig.map((filterSet, index) => {
        const isLastFilterSet = index === filterConfig.length - 1;
        return (
          <fieldset key={`${index}-${filterSet.title}`}>
            <legend className={cssClasses.title}>{filterSet.title}</legend>
            <div className={cssClasses.optionsContainer}>
              {filterSet.options.map((option, index) => {
                const filter = {
                  fieldId: option.fieldId,
                  matcher: Matcher.Equals,
                  value: option.value,
                };
                <CheckboxOption
                  option={{ id: `${index}`, label: option.label }}
                  onClick={(selected) => handleFilterOptionChange(filter, selected)}
                  selected={getOptionSelectStatus(option)}
                />;
              })}
            </div>
            {!isLastFilterSet && <Divider customCssClasses={{ divider: cssClasses.divider }} />}
          </fieldset>
        );
      })}
    </div>
  );
}

//prettier-ignore
interface DividerProps {
  customCssClasses?: {
    divider?: string
  },
  cssCompositionMethod?: CompositionMethod
}

export function Divider({ customCssClasses, cssCompositionMethod }: DividerProps) {
  const builtInCssClasses = {
    divider: 'w-full h-px bg-gray-200 my-4',
  };
  const cssClasses = useComposedCssClasses(builtInCssClasses, customCssClasses, cssCompositionMethod);
  return <div className={cssClasses.divider}></div>;
}
