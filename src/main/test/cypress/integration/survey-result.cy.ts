import * as Helpers from '../utils/helpers'
import * as Http from '../utils/http-mocks'

const path = 'api/surveys/any_id/results'
export const mockLoadSuccess = (): void => {
  Http.mockOk('api/surveys', 'GET', 'survey-list')
  Http.mockOk(path, 'GET', 'load-survey-result')
}

describe('SurveyResult', () => {
  describe('load', () => {
    const mockUnexpectedError = (): void => { Http.mockServerError(path, 'GET') }
    const mockAccessDeniedError = (): void => { Http.mockForbiddenError(path, 'GET') }

    beforeEach(() => {
      cy.fixture('account').then(account => {
        Helpers.setLocalStorageItem('account', account)
      })
    })

    it('Should present error on UnexpectedError', () => {
      mockUnexpectedError()
      cy.visit('/surveys/any_id')
      cy.getByTestId('error').should('contain.text', 'Algo de errado aconteceu, Tente novamente em breve.')
    })

    it('Should reload on button click', () => {
      mockUnexpectedError()
      cy.visit('/surveys/any_id')
      cy.getByTestId('error').should('contain.text', 'Algo de errado aconteceu, Tente novamente em breve.')
      mockLoadSuccess()
      cy.getByTestId('reload').click()
      cy.getByTestId('question').should('exist')
    })

    it('Should logout on AccessDeniedError', () => {
      mockAccessDeniedError()
      cy.visit('/surveys/any_id')
      Helpers.testUrl('/login')
    })

    it('Should present survey result', () => {
      mockLoadSuccess()
      cy.visit('/surveys/any_id')
      cy.getByTestId('question').should('have.text', 'Question')
      cy.getByTestId('day').should('have.text', '21')
      cy.getByTestId('month').should('have.text', 'dez')
      cy.getByTestId('year').should('have.text', '2022')
      cy.get('li:nth-child(1)').then(li => {
        assert.equal(li.find('[data-testid="answer"]').text(), 'any_answer')
        assert.equal(li.find('[data-testid="percent"]').text(), '70%')
        assert.equal(li.find('[data-testid="image"]').attr('src'), 'any_image')
      })
      cy.get('li:nth-child(2)').then(li => {
        assert.equal(li.find('[data-testid="answer"]').text(), 'any_answer_2')
        assert.equal(li.find('[data-testid="percent"]').text(), '30%')
        assert.notExists(li.find('[data-testid="image"]'))
      })
    })

    it('Should goto SurveyList on back button click', () => {
      mockLoadSuccess()
      cy.visit('')
      cy.visit('/surveys/any_id')
      cy.getByTestId('back-button').click().then(() => {
        Helpers.testUrl('/')
      })
    })
  })

  describe('save', () => {
    const mockUnexpectedError = (): void => { Http.mockServerError(path, 'PUT') }
    const mockAccessDeniedError = (): void => { Http.mockForbiddenError(path, 'PUT') }
    const mockSaveSuccess = (): void => {
      Http.mockOk('api/surveys', 'GET', 'survey-list')
      Http.mockOk(path, 'PUT', 'save-survey-result')
    }

    beforeEach(() => {
      cy.fixture('account').then(account => {
        Helpers.setLocalStorageItem('account', account)
      })
      mockLoadSuccess()
      cy.visit('/surveys/any_id')
    })

    it('Should present error on UnexpectedError', () => {
      mockUnexpectedError()
      cy.get('li:nth-child(2)').click()
      cy.getByTestId('error').should('contain.text', 'Algo de errado aconteceu, Tente novamente em breve.')
    })

    it('Should logout on AccessDeniedError', () => {
      mockAccessDeniedError()
      cy.get('li:nth-child(2)').click()
      Helpers.testUrl('/login')
    })

    it('Should present survey result', () => {
      mockSaveSuccess()
      cy.get('li:nth-child(2)').click()
      cy.getByTestId('question').should('have.text', 'Other Question')
      cy.getByTestId('day').should('have.text', '21')
      cy.getByTestId('month').should('have.text', 'dez')
      cy.getByTestId('year').should('have.text', '2023')
      cy.get('li:nth-child(1)').then(li => {
        assert.equal(li.find('[data-testid="answer"]').text(), 'other_answer')
        assert.equal(li.find('[data-testid="percent"]').text(), '50%')
        assert.equal(li.find('[data-testid="image"]').attr('src'), 'other_image')
      })
      cy.get('li:nth-child(2)').then(li => {
        assert.equal(li.find('[data-testid="answer"]').text(), 'other_answer_2')
        assert.equal(li.find('[data-testid="percent"]').text(), '50%')
        assert.notExists(li.find('[data-testid="image"]'))
      })
    })
  })
})